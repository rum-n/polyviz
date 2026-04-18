"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, shortenAddress } from "@/lib/utils";

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

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
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
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {shortenAddress(address)}
        </div>
      </div>
    </header>
  );
}
