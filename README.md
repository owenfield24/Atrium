# Atrium Website

Source for the Atrium SaaS marketing site and dashboard.

**Live:** https://atrium-v9.vercel.app
**Stack:** Next.js 15+ · React 19 · TypeScript · Tailwind CSS

## Running locally

```sh
npm install
npm run dev
```

The dev script in `package.json` runs `next dev --webpack --port 9001`.
Open http://localhost:9001 in your browser.

## Project layout

```
app/
├── (marketing)/          public marketing site
│   ├── page.tsx          landing
│   ├── pricing/          pricing tiers
│   ├── features/         feature deep dives
│   └── about/            about + positioning
└── (app)/                authenticated dashboard
    ├── layout.tsx        sidebar shell
    ├── dashboard/        greeting + stats + quick launch
    ├── brief/            housing-market daily brief
    ├── listings/         IDX-compliant listings
    ├── clients/          CRM
    ├── transactions/     pipeline board
    ├── keystone/         property management (B → U → T)
    ├── marketing/        marketing studio
    ├── insights/         DFW / national market data
    ├── integrations/     MLS feeds + vendor tooling
    ├── team/             seats / splits / Atrium Academy
    ├── compliance/       audit log + IDX rules
    ├── billing/          plan, seats, sales-tax nexus
    └── settings/         account / brokerage / security

components/
├── AtriumLogo.tsx        the new "A with light rays" mark
├── Sidebar.tsx           floating glass icon sidebar (hover to expand)
├── marketing/Nav.tsx     floating pill nav for marketing
├── marketing/Footer.tsx
└── ui/                   reusable UI primitives (Card, Tabs, Badge)

lib/
├── utils.ts              fmt, fmtCompact, timeAgo, clsx
├── mls/data.ts           seeded listings + clients + notes
├── mls/matching.ts       client-preference scoring
├── saas/data.ts          mock data for dashboard modules
└── brief/                housing-market brief
    ├── fetchers.ts       live Freddie Mac PMMS + Treasury fetches; FRED-conditional
    ├── regions.ts        16 metros for the regional spotlight
    └── types.ts

types/index.ts            shared TypeScript types
```

## Brief — live data sources

The `/brief` page fetches live data on each ISR revalidation (every 6 hours).

| Indicator | Source | Notes |
|---|---|---|
| 30-yr / 15-yr fixed rates | Freddie Mac PMMS history CSV | Public, no key required |
| 10-yr Treasury yield | U.S. Treasury daily yield curve | Public, no key required |
| Median price · existing sales · supply · permits | FRED API | Auto-upgrades to live if `FRED_API_KEY` is set; otherwise shows last published values |

To enable full live data, set `FRED_API_KEY` in your Vercel environment variables. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html.

## Deployment

This project deploys to Vercel as a standard Next.js app.

```sh
vercel deploy --prod
```
