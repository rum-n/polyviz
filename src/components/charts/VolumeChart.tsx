"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPnL } from "@/lib/polymarket/types";
import { formatUSDC } from "@/lib/utils";

interface VolumeChartProps {
  data: DailyPnL[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          tickFormatter={(v) => `$${v.toFixed(0)}`}
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
          formatter={(value) => [formatUSDC(Number(value)), "Volume"]}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
        />
        <Bar dataKey="volume" fill="#3b82f6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
