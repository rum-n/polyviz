"use client";

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Position } from "@/lib/polymarket/types";
import { isPositionClosed } from "@/lib/polymarket/client";
import { formatUSDC } from "@/lib/utils";

interface PositionScatterProps {
  positions: Position[];
}

export function PositionScatter({ positions }: PositionScatterProps) {
  const closed = positions.filter(isPositionClosed);

  const data = closed.map((p) => ({
    invested: p.totalBought,
    pnl: p.cashPnl,
    title: p.title,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
        No closed positions yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="invested"
          name="Invested"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          label={{
            value: "Amount invested ($)",
            position: "insideBottom",
            offset: -2,
            fill: "#52525b",
            fontSize: 11,
          }}
        />
        <YAxis
          dataKey="pnl"
          name="P&L"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={55}
        />
        <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#e4e4e7",
          }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { invested: number; pnl: number; title: string };
            return (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs">
                <p className="mb-1 max-w-[180px] truncate text-zinc-300">
                  {d.title}
                </p>
                <p>Invested: {formatUSDC(d.invested)}</p>
                <p className={d.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                  P&L: {formatUSDC(d.pnl)}
                </p>
              </div>
            );
          }}
        />
        <Scatter
          data={data}
          shape={(props: { cx?: number; cy?: number; payload?: { pnl: number } }) => {
            const { cx = 0, cy = 0, payload } = props;
            const win = payload && payload.pnl >= 0;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={win ? "#10b981" : "#ef4444"}
                fillOpacity={0.7}
              />
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
