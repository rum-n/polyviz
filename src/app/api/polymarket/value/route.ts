import { NextRequest } from "next/server";

const POLYMARKET_DATA_API = "https://data-api.polymarket.com";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  const upstream = await fetch(
    `${POLYMARKET_DATA_API}/value?user=${address}`,
    { headers: { Accept: "application/json" } }
  );

  if (!upstream.ok) {
    return Response.json(
      { error: "Polymarket API error" },
      { status: upstream.status }
    );
  }

  // API returns an array: [{user, value}] — unwrap to a single object
  const data = await upstream.json();
  const row = Array.isArray(data) ? (data[0] ?? { value: 0 }) : data;
  return Response.json({ value: row.value ?? 0 });
}
