# polyviz

An open-source visualization platform for your [Polymarket](https://polymarket.com) account. See your trading activity, P&L, win rate, and strategy performance — all in one place.

**Read-only. No wallet connection required.**

## Features

- **Portfolio overview** — current positions, portfolio value, daily and all-time P&L
- **Cumulative P&L chart** — realized profit/loss over time derived from trade history
- **Trade history** — filterable and searchable table of all buys, sells, and redeems
- **Performance analytics** — daily volume chart, win/loss breakdown, position size vs outcome scatter

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your Ethereum wallet address, and explore.

## Architecture

```
src/
├── app/
│   ├── page.tsx                          # Landing page (address input)
│   ├── [address]/
│   │   ├── layout.tsx                    # Dashboard layout with navbar
│   │   ├── page.tsx                      # Overview (positions + P&L chart)
│   │   ├── trades/page.tsx               # Full trade history
│   │   └── performance/page.tsx          # Analytics and charts
│   └── api/polymarket/
│       ├── positions/route.ts            # Proxy → data-api.polymarket.com/positions
│       ├── activity/route.ts             # Proxy → data-api.polymarket.com/activity
│       └── value/route.ts               # Proxy → data-api.polymarket.com/value
├── components/
│   ├── charts/                           # Recharts-based chart components
│   ├── layout/                           # Navbar
│   └── ui/                              # Card, Badge, Button, Skeleton
└── lib/
    ├── polymarket/
    │   ├── types.ts                      # TypeScript types for Polymarket API
    │   └── client.ts                     # Fetch helpers + P&L/win-rate computation
    └── utils.ts                          # Formatting utilities
```

The Next.js API routes act as a proxy layer to avoid CORS issues when calling the Polymarket Data API from the browser. No backend or database is required — all data is fetched live from Polymarket's public endpoints.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Recharts](https://recharts.org) for charts
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide React](https://lucide.dev) for icons

## Deploy

One-click deploy on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/polyviz)

## Contributing

Issues and PRs welcome. The Polymarket Data API is public — if you discover new endpoints that unlock useful data, open an issue.

## License

MIT
