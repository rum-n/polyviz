"use client";

import { use, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";

const STORAGE_KEY = "polyviz_address";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, address);
  }, [address]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar address={address} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
