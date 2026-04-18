import { NextRequest } from "next/server";

const POLYMARKET_DATA_API = "https://data-api.polymarket.com";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  const limit = req.nextUrl.searchParams.get("limit") ?? "500";
  const offset = req.nextUrl.searchParams.get("offset") ?? "0";

  const upstream = await fetch(
    `${POLYMARKET_DATA_API}/activity?user=${address}&limit=${limit}&offset=${offset}`,
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
