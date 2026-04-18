import type { ActivityItem, DailyPnL, Position, PortfolioValue, WinLossStat } from "./types";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || path}`);
  }
  return res.json();
}

export async function fetchPositions(address: string): Promise<Position[]> {
  return apiFetch<Position[]>(`/api/polymarket/positions?address=${address}`);
}

const PAGE_SIZE = 500;
const MAX_OFFSET = 3000; // Polymarket hard cap

export async function fetchActivity(address: string): Promise<ActivityItem[]> {
  const pages: ActivityItem[][] = [];
  let offset = 0;
  while (true) {
    const page = await apiFetch<ActivityItem[]>(
      `/api/polymarket/activity?address=${address}&limit=${PAGE_SIZE}&offset=${offset}`
    );
    if (page.length === 0) break;
    pages.push(page);
    if (page.length < PAGE_SIZE || offset >= MAX_OFFSET) break;
    offset += PAGE_SIZE;
  }
  return pages.flat();
}

export async function fetchPortfolioValue(address: string): Promise<PortfolioValue> {
  return apiFetch<PortfolioValue>(`/api/polymarket/value?address=${address}`);
}

export function isPositionClosed(position: Position): boolean {
  if (position.redeemable) return true;
  const end = new Date(position.endDate);
  return !isNaN(end.getTime()) && end < new Date();
}

export function computeDailyPnL(activity: ActivityItem[]): DailyPnL[] {
  const byDay = new Map<string, { realized: number; volume: number }>();

  const trades = activity.filter(
    (a) => a.type === "TRADE" || a.type === "REDEEM"
  );

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sorted) {
    // timestamp is Unix seconds
    const day = new Date(item.timestamp * 1000).toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { realized: 0, volume: 0 };
    if (item.side === "SELL" || item.type === "REDEEM") {
      entry.realized += item.usdcSize;
    } else {
      entry.realized -= item.usdcSize;
    }
    entry.volume += item.usdcSize;
    byDay.set(day, entry);
  }

  let cumulative = 0;
  return Array.from(byDay.entries()).map(([date, { realized, volume }]) => {
    cumulative += realized;
    return { date, realizedPnl: realized, cumulativePnl: cumulative, volume };
  });
}

// Win/loss from activity: groups all trades by market, net cashflow per market determines win/loss.
// Covers redeemed positions that no longer appear in the positions endpoint.
export function computeWinLossFromActivity(activity: ActivityItem[]): WinLossStat {
  const byMarket = new Map<string, number>();

  for (const item of activity) {
    if (item.type !== "TRADE" && item.type !== "REDEEM") continue;
    const key = item.conditionId || item.asset;
    if (!key) continue;
    const current = byMarket.get(key) ?? 0;
    if (item.side === "SELL" || item.type === "REDEEM") {
      byMarket.set(key, current + item.usdcSize);
    } else {
      byMarket.set(key, current - item.usdcSize);
    }
  }

  const nets = Array.from(byMarket.values());
  const wins = nets.filter((n) => n > 0);
  const losses = nets.filter((n) => n <= 0);

  return {
    wins: wins.length,
    losses: losses.length,
    winRate: nets.length ? wins.length / nets.length : 0,
    avgWin: wins.length ? wins.reduce((s, n) => s + n, 0) / wins.length : 0,
    avgLoss: losses.length ? losses.reduce((s, n) => s + n, 0) / losses.length : 0,
  };
}

export function computeWinLoss(positions: Position[]): WinLossStat {
  const closed = positions.filter(isPositionClosed);
  const wins = closed.filter((p) => p.cashPnl > 0);
  const losses = closed.filter((p) => p.cashPnl <= 0);

  const avgWin = wins.length
    ? wins.reduce((s, p) => s + p.cashPnl, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? losses.reduce((s, p) => s + p.cashPnl, 0) / losses.length
    : 0;

  return {
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length ? wins.length / closed.length : 0,
    avgWin,
    avgLoss,
  };
}
