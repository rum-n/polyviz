"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import {
  fetchPortfolioValue,
  fetchPositions,
  fetchActivity,
  computeDailyPnL,
  isPositionClosed,
} from "@/lib/polymarket/client";
import type { Position, PortfolioValue, DailyPnL } from "@/lib/polymarket/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PnLChart } from "@/components/charts/PnLChart";
import { formatUSDC, formatPercent, formatDate } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/info-tooltip";

function StatCard({
  label,
  value,
  sub,
  positive,
  tooltip,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  tooltip?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-1.5 text-sm text-zinc-400">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold ${
          positive === undefined
            ? "text-zinc-100"
            : positive
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-zinc-400">{sub}</div>}
    </Card>
  );
}

export default function OverviewPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnlData, setPnlData] = useState<DailyPnL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [value, pos, activity] = await Promise.all([
          fetchPortfolioValue(address),
          fetchPositions(address),
          fetchActivity(address),
        ]);
        setPortfolioValue(value);
        setPositions(pos);
        setPnlData(computeDailyPnL(activity));
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-red-400">
        <span>{error}</span>
        <span className="text-xs text-zinc-400">Check the browser console for details.</span>
      </div>
    );
  }

  const openPositions = positions.filter((p) => !isPositionClosed(p));
  const allTimePnl = positions.reduce((s, p) => s + p.cashPnl, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value={formatUSDC(portfolioValue?.value ?? 0)}
          tooltip="Current market value of all your open positions, priced at their latest mid-market price."
        />
        <StatCard
          label="All-time P&L"
          value={formatUSDC(allTimePnl)}
          positive={allTimePnl >= 0}
          tooltip="Total profit or loss across all positions — open and closed — based on cost basis vs current or final value."
        />
        <StatCard
          label="Open positions"
          value={String(openPositions.length)}
          tooltip="Number of markets where you currently hold shares."
        />
        <StatCard
          label="Total positions"
          value={String(positions.length)}
          tooltip="Total number of markets you have ever participated in, including closed and redeemed ones."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative realized P&L</CardTitle>
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
          <CardTitle>Open positions</CardTitle>
          <span className="text-xs text-zinc-400">{openPositions.length} active</span>
        </CardHeader>
        {openPositions.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-400">
            No open positions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-xs text-zinc-400">
                  <th className="pb-2 font-medium">Market</th>
                  <th className="pb-2 font-medium">Outcome</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Value</th>
                  <th className="pb-2 text-right font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map((pos, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-700/50 last:border-0"
                  >
                    <td className="py-2.5 pr-4">
                      <div className="max-w-[280px] truncate text-zinc-200">
                        {pos.title}
                      </div>
                      {pos.endDate && (
                        <div className="text-xs text-zinc-400">
                          Closes {formatDate(pos.endDate)}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="outline">{pos.outcome}</Badge>
                    </td>
                    <td className="py-2.5 text-right text-zinc-300">
                      {formatPercent(pos.curPrice)}
                    </td>
                    <td className="py-2.5 text-right text-zinc-300">
                      {formatUSDC(pos.currentValue)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-medium ${
                        pos.cashPnl >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {pos.cashPnl >= 0 ? "+" : ""}
                      {formatUSDC(pos.cashPnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
