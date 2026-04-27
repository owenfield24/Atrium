# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install
npm run dev      # next dev --webpack --port 9001  →  http://localhost:9001
npm run build    # next build
npm run start    # next start (serves the production build)
```

There is no test runner, linter, or formatter wired up. Type-checking happens via `next build` (or `npx tsc --noEmit`).

Note: the `dev` script passes `--webpack`, which Next 15.5 does not accept as a CLI flag. If `npm run dev` errors with `unknown option '--webpack'`, run `npx next dev --port 9001` directly, or remove the flag from `package.json`.

## Architecture

This is a Next.js 15 App Router project (React 19, TypeScript, Tailwind). It is the marketing site **and** the (mock) authenticated dashboard for Atrium, a real-estate operations SaaS. There is no backend in this repo — dashboard data is seeded from `lib/`.

### Route groups split shell + concerns

`app/` uses two route groups that are intentionally siblings, not nested:

- `app/(marketing)/` — public site (landing, pricing, features, about). Uses `components/marketing/Nav.tsx` + `Footer.tsx`.
- `app/(app)/` — authenticated-style dashboard. Its `layout.tsx` mounts `components/Sidebar.tsx` (floating glass icon rail) and offsets `<main>` by `md:pl-20`. Every dashboard page lives under this group.

Routes that need a different chrome belong in a different group, not nested under one of these layouts.

### Data layer is mock-by-default, live-where-it-matters

- `lib/saas/data.ts`, `lib/mls/data.ts`, `lib/mls/matching.ts` — seeded fixtures consumed synchronously by dashboard pages.
- `lib/brief/fetchers.ts` — the `/brief` page is the **only** page with live external fetches. It calls Freddie Mac PMMS (CSV), U.S. Treasury daily yield curve, and FRED (conditional on `FRED_API_KEY`).
- Caching is two-tiered: `app/(app)/brief/page.tsx` exports `revalidate = 21600` (6 h ISR), and each `fetch()` in `fetchers.ts` also passes `{ next: { revalidate: 21600 } }` as a safety net.
- Every indicator carries a `live: boolean` flag. When a fetch fails, `fetchers.ts` falls back to baked-in last-published values and sets `live: false` so the UI can render a "cached" pill. Preserve this contract when adding indicators.
- `FRED_API_KEY` is optional; without it, FRED-backed indicators fall through to the fallback path rather than erroring.

### Path alias

`@/*` resolves to the repo root (see `tsconfig.json`), e.g. `import Sidebar from "@/components/Sidebar"`.

### Next config quirks

`next.config.js` sets `trailingSlash: true` and `images: { unoptimized: true }` (the project deploys as a static-leaning Vercel build with no Image Optimization service). Use `<img>` or be aware that `next/image` will not optimize.

## Deployment

Vercel, standard Next preset. `vercel deploy --prod`. Live site: https://atrium-v9.vercel.app.
