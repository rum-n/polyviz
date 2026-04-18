import { NextRequest } from "next/server";

const POLYMARKET_DATA_API = "https://data-api.polymarket.com";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  const upstream = await fetch(
    `${POLYMARKET_DATA_API}/positions?user=${address}&sizeThreshold=.01`,
    { headers: { Accept: "application/json" } }
  );

  if (!upstream.ok) {
    return Response.json(
      { error: "Polymarket API error" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  return Response.json(data);
}
