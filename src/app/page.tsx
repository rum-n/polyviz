"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isValidAddress } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!isValidAddress(trimmed)) {
      setError("Please enter a valid Ethereum address (0x…)");
      return;
    }
    router.push(`/${trimmed}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            poly<span className="text-blue-400">viz</span>
          </h1>
          <p className="text-zinc-400">
            Visualize your Polymarket trading activity and strategy performance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="address"
              className="text-sm font-medium text-zinc-300"
            >
              Wallet address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError("");
              }}
              placeholder="0x..."
              spellCheck={false}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            View dashboard →
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Read-only. No wallet connection required.
        </p>
      </div>
    </main>
  );
}
