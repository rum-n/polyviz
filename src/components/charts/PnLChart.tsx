"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPnL } from "@/lib/polymarket/types";
import { formatUSDC } from "@/lib/utils";

interface PnLChartProps {
  data: DailyPnL[];
}

export function PnLChart({ data }: PnLChartProps) {
  const isPositive =
    data.length === 0 || data[data.length - 1].cumulativePnl >= 0;

  const color = isPositive ? "#10b981" : "#ef4444";
  const gradientId = "pnlGradient";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d) =>
            new Date(d).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v >= 0 ? "" : "-"}${Math.abs(v).toFixed(0)}`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#e4e4e7",
          }}
          formatter={(value) => [formatUSDC(Number(value)), "Cumulative P&L"]}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
        />
        <Area
          type="monotone"
          dataKey="cumulativePnl"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
