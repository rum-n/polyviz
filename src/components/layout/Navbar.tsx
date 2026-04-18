"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { cn, shortenAddress } from "@/lib/utils";

const STORAGE_KEY = "polyviz_address";

interface NavbarProps {
  address: string;
}

const navItems = [
  { label: "Overview", href: "" },
  { label: "Trades", href: "/trades" },
  { label: "Performance", href: "/performance" },
];

export function Navbar({ address }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/");
  }

  return (
    <header className="border-b border-zinc-700/60 bg-zinc-800/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          poly<span className="text-blue-400">viz</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const href = `/${address}${item.href}`;
            const active = pathname === href;
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:bg-zinc-700/60 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-zinc-600 bg-zinc-700 px-3 py-1.5 text-xs font-mono text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {shortenAddress(address)}
          </div>
          <button
            onClick={handleSwitch}
            title="Switch address"
            className="flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-600 hover:text-white"
          >
            <ArrowLeftRight size={12} />
            Switch
          </button>
        </div>
      </div>
    </header>
  );
}
