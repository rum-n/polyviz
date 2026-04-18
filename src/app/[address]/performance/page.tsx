"use client";

import { useEffect, useState, use } from "react";
import {
  fetchActivity,
  fetchPositions,
  computeDailyPnL,
  computeWinLoss,
  computeWinLossFromActivity,
  isPositionClosed,
} from "@/lib/polymarket/client";
import type { ActivityItem, DailyPnL, Position, WinLossStat } from "@/lib/polymarket/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PnLChart } from "@/components/charts/PnLChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { WinRateChart } from "@/components/charts/WinRateChart";
import { PositionScatter } from "@/components/charts/PositionScatter";
import { formatUSDC, formatPercent } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export default function PerformancePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [pnlData, setPnlData] = useState<DailyPnL[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [winLossPositions, setWinLossPositions] = useState<WinLossStat | null>(null);
  const [winLossActivity, setWinLossActivity] = useState<WinLossStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [act, pos] = await Promise.all([
          fetchActivity(address),
          fetchPositions(address),
        ]);
        setActivity(act);
        setPositions(pos);
        setPnlData(computeDailyPnL(act));
        setWinLossPositions(computeWinLoss(pos));
        setWinLossActivity(computeWinLossFromActivity(act));
      } catch {
        setError("Failed to load performance data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  const totalRealizedPnL = pnlData.length
    ? pnlData[pnlData.length - 1].cumulativePnl
    : 0;
  const totalVolume = pnlData.reduce((s, d) => s + d.volume, 0);
  const closedPositions = positions.filter(isPositionClosed);
  const totalMarkets = (winLossActivity?.wins ?? 0) + (winLossActivity?.losses ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            Realized P&L
            <InfoTooltip content="Cumulative profit or loss from completed trades only — money actually received from sells and redeems, minus what you spent on buys." />
          </div>
          <div
            className={`mt-1 text-2xl font-semibold ${
              totalRealizedPnL >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUSDC(totalRealizedPnL)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            Total volume
            <InfoTooltip content="Total dollar value of all trades executed — buys, sells, and redeems combined." />
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {formatUSDC(totalVolume)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            Win rate (activity)
            <InfoTooltip content="Net cashflow per market from your trade history — a market is a win if total received (sells + redeems) exceeds total spent. Includes redeemed markets the positions endpoint no longer tracks." />
          </div>
          <div className="mt-1 text-2xl font-semibold text-blue-400">
            {winLossActivity ? formatPercent(winLossActivity.winRate) : "—"}
          </div>
          <div className="mt-0.5 text-xs text-zinc-400">
            {totalMarkets} markets traded
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-sm text-zinc-400">
            Avg win / loss
            <InfoTooltip content="Average net cashflow on winning markets vs losing markets, computed from trade history." />
          </div>
          <div className="mt-1 text-lg font-semibold">
            {winLossActivity && winLossActivity.wins > 0 ? (
              <>
                <span className="text-emerald-400">
                  {formatUSDC(winLossActivity.avgWin)}
                </span>
                {" / "}
                <span className="text-red-400">
                  {formatUSDC(winLossActivity.avgLoss)}
                </span>
              </>
            ) : (
              "—"
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative realized P&L over time</CardTitle>
          <InfoTooltip content="Running total of realized profit or loss, day by day. A rising line means you're making money on completed trades; a falling line means the opposite." />
        </CardHeader>
        {pnlData.length > 0 ? (
          <PnLChart data={pnlData} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
            No trading activity found
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily trading volume</CardTitle>
          <InfoTooltip content="Total dollars traded each day across all buys, sells, and redeems. Useful for spotting periods of high activity." />
        </CardHeader>
        {pnlData.length > 0 ? (
          <VolumeChart data={pnlData} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
            No trading activity found
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Win / loss — by trade history</CardTitle>
            <InfoTooltip content="Net cashflow per market from your activity feed. Covers your full history including redeemed markets. A market counts as one unit regardless of how many trades you made in it." />
          </CardHeader>
          {winLossActivity ? (
            <WinRateChart stat={winLossActivity} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No data
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win / loss — current wallet</CardTitle>
            <InfoTooltip content="Win rate based only on positions still in your wallet (open + unredeemed). Excludes markets you already redeemed, so this undercounts wins for active traders." />
          </CardHeader>
          {winLossPositions ? (
            <WinRateChart stat={winLossPositions} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
              No closed positions in wallet
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Position size vs P&L</CardTitle>
          <InfoTooltip content="Each dot is a closed position. X-axis is how much you invested; Y-axis is the P&L. Dots above the line are wins, below are losses. Look for patterns in bet sizing." />
        </CardHeader>
        <PositionScatter positions={positions} />
      </Card>
    </div>
  );
}
