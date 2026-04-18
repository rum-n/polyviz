import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar address={address} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
