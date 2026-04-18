"use client";

import { useEffect, useState, use } from "react";
import {
  fetchActivity,
  fetchPositions,
  computeDailyPnL,
  computeWinLoss,
  isPositionClosed,
} from "@/lib/polymarket/client";
import type { DailyPnL, Position, WinLossStat } from "@/lib/polymarket/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PnLChart } from "@/components/charts/PnLChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { WinRateChart } from "@/components/charts/WinRateChart";
import { PositionScatter } from "@/components/charts/PositionScatter";
import { formatUSDC, formatPercent } from "@/lib/utils";

export default function PerformancePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [pnlData, setPnlData] = useState<DailyPnL[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [winLoss, setWinLoss] = useState<WinLossStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [activity, pos] = await Promise.all([
          fetchActivity(address),
          fetchPositions(address),
        ]);
        setPnlData(computeDailyPnL(activity));
        setPositions(pos);
        setWinLoss(computeWinLoss(pos));
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-sm text-zinc-500">Realized P&L</div>
          <div
            className={`mt-1 text-2xl font-semibold ${
              totalRealizedPnL >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUSDC(totalRealizedPnL)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Total volume</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatUSDC(totalVolume)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Win rate</div>
          <div className="mt-1 text-2xl font-semibold text-blue-400">
            {winLoss ? formatPercent(winLoss.winRate) : "—"}
          </div>
          <div className="mt-0.5 text-xs text-zinc-600">
            {closedPositions.length} closed positions
          </div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Avg win / loss</div>
          <div className="mt-1 text-lg font-semibold">
            {winLoss && winLoss.wins > 0 ? (
              <>
                <span className="text-emerald-400">
                  {formatUSDC(winLoss.avgWin)}
                </span>
                {" / "}
                <span className="text-red-400">
                  {formatUSDC(winLoss.avgLoss)}
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
        </CardHeader>
        {pnlData.length > 0 ? (
          <PnLChart data={pnlData} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            No trading activity found
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily trading volume</CardTitle>
        </CardHeader>
        {pnlData.length > 0 ? (
          <VolumeChart data={pnlData} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
            No trading activity found
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Win / loss breakdown</CardTitle>
          </CardHeader>
          {winLoss ? (
            <WinRateChart stat={winLoss} />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
              No data
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position size vs P&L</CardTitle>
          </CardHeader>
          <PositionScatter positions={positions} />
        </Card>
      </div>
    </div>
  );
}
