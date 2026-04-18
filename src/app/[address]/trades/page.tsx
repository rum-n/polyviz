"use client";

import { useEffect, useState, use } from "react";
import { fetchActivity } from "@/lib/polymarket/client";
import type { ActivityItem } from "@/lib/polymarket/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSDC, formatDate } from "@/lib/utils";

type FilterSide = "ALL" | "BUY" | "SELL";

const PAGE_SIZE = 50;

export default function TradesPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterSide>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchActivity(address);
        setActivity(data);
      } catch {
        setError("Failed to load activity.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address]);

  // Reset to page 0 whenever filters change
  useEffect(() => { setPage(0); }, [filter, search]);

  const trades = activity.filter((a) => a.type === "TRADE" || a.type === "REDEEM");

  const filtered = trades.filter((t) => {
    const matchesSide = filter === "ALL" || t.side === filter;
    const matchesSearch = search
      ? t.title.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesSide && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totalBought = trades
    .filter((t) => t.side === "BUY")
    .reduce((s, t) => s + t.usdcSize, 0);
  const totalSold = trades
    .filter((t) => t.side === "SELL" || t.type === "REDEEM")
    .reduce((s, t) => s + t.usdcSize, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-zinc-500">Total trades</div>
          <div className="mt-1 text-2xl font-semibold">{trades.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Total bought</div>
          <div className="mt-1 text-2xl font-semibold text-red-400">
            {formatUSDC(totalBought)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Total sold / redeemed</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-400">
            {formatUSDC(totalSold)}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {(["ALL", "BUY", "SELL"] as FilterSide[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search markets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No trades match your filters
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Market</th>
                    <th className="pb-2 font-medium">Outcome</th>
                    <th className="pb-2 font-medium">Side</th>
                    <th className="pb-2 text-right font-medium">Price</th>
                    <th className="pb-2 text-right font-medium">Shares</th>
                    <th className="pb-2 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((trade, i) => (
                    <tr
                      key={`${trade.transactionHash}-${i}`}
                      className="border-b border-zinc-800/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(new Date(trade.timestamp * 1000).toISOString())}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="max-w-[260px] truncate text-zinc-200">
                          {trade.title}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge
                          variant={trade.outcome === "Yes" ? "success" : "danger"}
                        >
                          {trade.outcome}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge
                          variant={
                            trade.type === "REDEEM"
                              ? "warning"
                              : trade.side === "BUY"
                              ? "outline"
                              : "success"
                          }
                        >
                          {trade.type === "REDEEM" ? "REDEEM" : trade.side}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-zinc-300">
                        {(trade.price * 100).toFixed(1)}¢
                      </td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400">
                        {trade.size.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-medium text-zinc-200">
                        {formatUSDC(trade.usdcSize)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
                <span className="text-zinc-500">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((i) => Math.abs(i - page) <= 2)
                    .map((i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                          i === page
                            ? "bg-zinc-700 text-zinc-100"
                            : "text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages - 1}
                    className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page === totalPages - 1}
                    className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
