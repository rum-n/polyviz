"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { WinLossStat } from "@/lib/polymarket/types";
import { formatPercent, formatUSDC } from "@/lib/utils";

interface WinRateChartProps {
  stat: WinLossStat;
}

export function WinRateChart({ stat }: WinRateChartProps) {
  const total = stat.wins + stat.losses;
  const data = [
    { name: "Wins", value: stat.wins, color: "#10b981" },
    { name: "Losses", value: stat.losses, color: "#ef4444" },
  ];

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
        No closed positions yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#e4e4e7",
            }}
            formatter={(value, name) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <div className="text-2xl font-semibold text-emerald-400">
            {formatPercent(stat.winRate)}
          </div>
          <div className="text-zinc-500">Win rate</div>
        </div>
        <div className="flex gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">{stat.wins} wins</span>
            </div>
            <div className="ml-3.5 text-xs text-zinc-500">
              avg {formatUSDC(stat.avgWin)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-zinc-300">{stat.losses} losses</span>
            </div>
            <div className="ml-3.5 text-xs text-zinc-500">
              avg {formatUSDC(stat.avgLoss)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
