import type { Indicator, RatePoint, BriefData } from "./types";

// ── Cache hint shared across all fetches ─────────────────────────────
// Server components in Next call fetch() with `next.revalidate` to control
// the per-request cache. We let the page-level `revalidate` export decide
// the wall-clock cadence, but also pass a per-fetch hint so we never serve
// data older than 6 hours even on a busy page.
const CACHE_HINT = { next: { revalidate: 21600 } } as const;

// ── Date helpers ─────────────────────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDelta(curr: number, prev: number, decimals = 2): { delta: string; up: boolean } {
  const diff = curr - prev;
  const up = diff > 0;
  return {
    delta: (up ? "▲ " : "▼ ") + Math.abs(diff).toFixed(decimals),
    up,
  };
}

// ── Fallback values ──────────────────────────────────────────────────
// Used when a network fetch fails or a parse breaks. Keep the values
// reasonable and clearly mark them with `live: false` so the UI can show
// a "cached" pill.
const TODAY = fmtDate(new Date());

const FALLBACK: BriefData["indicators"] = {
  thirty:        { label: "30-yr fixed (avg)",  value: "5.84%",   delta: "▼ 0.12",  up: false, source: "Freddie Mac PMMS",  link: "https://www.freddiemac.com/pmms",                 asOf: "Apr 24, 2026", live: false },
  fifteen:       { label: "15-yr fixed",         value: "5.21%",   delta: "▼ 0.08",  up: false, source: "Freddie Mac PMMS",  link: "https://www.freddiemac.com/pmms",                 asOf: "Apr 24, 2026", live: false },
  tenYr:         { label: "10-yr Treasury",      value: "4.31%",   delta: "▼ 0.05",  up: false, source: "U.S. Treasury",      link: "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics", asOf: "Apr 25, 2026", live: false },
  medianPrice:   { label: "Median sale price",   value: "$412,400",delta: "▲ 1.2% YoY", up: true, source: "NAR · existing-home", link: "https://www.nar.realtor/research-and-statistics/housing-statistics/existing-home-sales", asOf: "Mar 2026", live: false },
  existingSales: { label: "Existing-home sales", value: "4.18M",   delta: "▲ 2.3%",  up: true,  source: "NAR · annualized",   link: "https://www.nar.realtor/research-and-statistics/housing-statistics/existing-home-sales", asOf: "Mar 2026", live: false },
  monthsSupply:  { label: "Months of supply",    value: "3.4",     delta: "▼ 0.2",   up: false, source: "NAR",                 link: "https://www.nar.realtor/research-and-statistics/housing-statistics", asOf: "Mar 2026", live: false },
  permits:       { label: "Building permits",   value: "1.43M",    delta: "▼ 0.4%",  up: false, source: "Census · annualized", link: "https://www.census.gov/construction/nrc/historical_data/index.html", asOf: "Mar 2026", live: false },
  mortgageApps:  { label: "Mortgage applications", value: "+8.7%", delta: "WoW",     up: true,  source: "MBA · seas. adj.",    link: "https://www.mba.org/news-and-research/research-and-economics/single-family-research/weekly-applications-survey", asOf: "Apr 23, 2026", live: false },
};

// ── Source 1: Freddie Mac PMMS — public weekly CSV ───────────────────
// Real schema (verified Apr 2026):
//   date,pmms30,pmms30p,pmms15,pmms15p,pmms51,pmms51p,pmms51m,pmms51spread
//   pmms30  = 30-yr fixed (rate)
//   pmms30p = 30-yr fixed (points)
//   pmms15  = 15-yr fixed (rate)
//   pmms51  = 5/1 ARM (rate)
async function fetchFreddieMacPMMS(): Promise<{
  thirty: Indicator;
  fifteen: Indicator;
  series52w: RatePoint[];
} | null> {
  const url = "https://www.freddiemac.com/pmms/docs/PMMS_history.csv";
  try {
    const res = await fetch(url, { ...CACHE_HINT, headers: { "User-Agent": "AtriumBriefBot/1.0 (+https://atrium.so/brief)" } });
    if (!res.ok) throw new Error(`PMMS HTTP ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 3) throw new Error("PMMS CSV too short");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const dateCol    = header.findIndex((h) => h === "date");
    const thirtyCol  = header.findIndex((h) => h === "pmms30");
    const fifteenCol = header.findIndex((h) => h === "pmms15");
    if ([dateCol, thirtyCol, fifteenCol].some((i) => i < 0)) {
      throw new Error("PMMS columns not found: " + JSON.stringify(header));
    }

    type Row = { date: Date; iso: string; thirty: number; fifteen: number };
    const rows: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i].split(",");
      const t = parseFloat(c[thirtyCol]);
      const f = parseFloat(c[fifteenCol]);
      const raw = c[dateCol]?.trim();
      if (!raw || !isFinite(t) || !isFinite(f)) continue;
      // Try ISO YYYY-MM-DD first, then MM/DD/YYYY (Freddie Mac historically uses both)
      let dt: Date;
      const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const usMatch  = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (isoMatch) {
        dt = new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]));
      } else if (usMatch) {
        dt = new Date(Date.UTC(+usMatch[3], +usMatch[1] - 1, +usMatch[2]));
      } else {
        dt = new Date(raw);
      }
      if (isNaN(dt.getTime())) continue;
      const iso = dt.toISOString().slice(0, 10);
      rows.push({ date: dt, iso, thirty: t, fifteen: f });
    }
    if (rows.length < 2) throw new Error("PMMS rows too few");
    rows.sort((a, b) => a.date.getTime() - b.date.getTime());

    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    const dThirty  = fmtDelta(last.thirty,  prev.thirty);
    const dFifteen = fmtDelta(last.fifteen, prev.fifteen);

    const series52w: RatePoint[] = rows.slice(-52).map((r) => ({
      date: r.iso,
      thirty: r.thirty,
      fifteen: r.fifteen,
    }));

    return {
      thirty: {
        label: "30-yr fixed (avg)",
        value: last.thirty.toFixed(2) + "%",
        delta: dThirty.delta,
        up: dThirty.up,
        source: "Freddie Mac PMMS",
        link: "https://www.freddiemac.com/pmms",
        asOf: fmtDate(last.date),
        live: true,
      },
      fifteen: {
        label: "15-yr fixed",
        value: last.fifteen.toFixed(2) + "%",
        delta: dFifteen.delta,
        up: dFifteen.up,
        source: "Freddie Mac PMMS",
        link: "https://www.freddiemac.com/pmms",
        asOf: fmtDate(last.date),
        live: true,
      },
      series52w,
    };
  } catch (e) {
    console.warn("[brief] Freddie Mac fetch failed:", String(e));
    return null;
  }
}

// ── Source 2: U.S. Treasury — daily yield curve CSV ──────────────────
async function fetchTreasury10y(): Promise<Indicator | null> {
  const year = new Date().getUTCFullYear();
  const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;
  try {
    const res = await fetch(url, { ...CACHE_HINT, headers: { "User-Agent": "AtriumBriefBot/1.0 (+https://atrium.so/brief)" } });
    if (!res.ok) throw new Error(`Treasury HTTP ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 3) throw new Error("Treasury CSV too short");
    const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const dateCol = header.findIndex((h) => h.toLowerCase() === "date");
    // Treasury CSV header for 10-yr is "10 Yr"
    const tenCol  = header.findIndex((h) => h.toLowerCase().replace(/\s+/g, "") === "10yr");
    if (dateCol < 0 || tenCol < 0) throw new Error("Treasury columns not found: " + JSON.stringify(header));

    type Row = { date: Date; ten: number };
    const rows: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, ""));
      const d = new Date(cols[dateCol]);
      const t = parseFloat(cols[tenCol]);
      if (!isFinite(t) || isNaN(d.getTime())) continue;
      rows.push({ date: d, ten: t });
    }
    if (rows.length < 2) throw new Error("Treasury rows too few");
    rows.sort((a, b) => a.date.getTime() - b.date.getTime());
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    const d = fmtDelta(last.ten, prev.ten);
    return {
      label: "10-yr Treasury",
      value: last.ten.toFixed(2) + "%",
      delta: d.delta,
      up: d.up,
      source: "U.S. Treasury",
      link: "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics",
      asOf: fmtDate(last.date),
      live: true,
    };
  } catch (e) {
    console.warn("[brief] Treasury fetch failed:", String(e));
    return null;
  }
}

// ── Source 3 (optional): FRED — only used if FRED_API_KEY is set ─────
// Wire this so each FRED-backed indicator auto-upgrades from "as-of" to live
// the moment a key is configured in the Vercel env.
async function fetchFred(seriesId: string): Promise<{ value: number; date: Date; prev?: number } | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${key}&file_type=json&sort_order=desc&limit=2`;
  try {
    const res = await fetch(url, CACHE_HINT);
    if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
    const json = (await res.json()) as { observations: { date: string; value: string }[] };
    const obs = json.observations.filter((o) => o.value !== ".");
    if (!obs[0]) return null;
    return {
      value: parseFloat(obs[0].value),
      date: new Date(obs[0].date),
      prev: obs[1] ? parseFloat(obs[1].value) : undefined,
    };
  } catch (e) {
    console.warn(`[brief] FRED ${seriesId} failed:`, String(e));
    return null;
  }
}

async function fredIndicator(opts: {
  series: string;
  label: string;
  format: (n: number) => string;
  fallback: Indicator;
  decimals?: number;
}): Promise<Indicator> {
  const r = await fetchFred(opts.series);
  if (!r) return opts.fallback;
  const delta = r.prev !== undefined ? fmtDelta(r.value, r.prev, opts.decimals ?? 2) : { delta: "—", up: true };
  return {
    label: opts.label,
    value: opts.format(r.value),
    delta: delta.delta,
    up: delta.up,
    source: "FRED · Federal Reserve",
    link: `https://fred.stlouisfed.org/series/${opts.series}`,
    asOf: fmtDate(r.date),
    live: true,
  };
}

// ── Main entry point ─────────────────────────────────────────────────
export async function getBriefData(): Promise<BriefData> {
  // Run independent fetches in parallel
  const [pmms, ten, msp, ehs, msa, permits] = await Promise.all([
    fetchFreddieMacPMMS(),
    fetchTreasury10y(),
    fredIndicator({
      series: "MSPUS",
      label: "Median sale price",
      format: (n) => "$" + Math.round(n).toLocaleString("en-US"),
      fallback: FALLBACK.medianPrice,
    }),
    fredIndicator({
      series: "EXHOSLUSM495S",
      label: "Existing-home sales",
      format: (n) => (n / 1_000_000).toFixed(2) + "M",
      fallback: FALLBACK.existingSales,
    }),
    fredIndicator({
      series: "MSACSR",
      label: "Months of supply",
      format: (n) => n.toFixed(1),
      decimals: 1,
      fallback: FALLBACK.monthsSupply,
    }),
    fredIndicator({
      series: "PERMIT",
      label: "Building permits",
      format: (n) => (n / 1000).toFixed(2) + "M",
      fallback: FALLBACK.permits,
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    indicators: {
      thirty:        pmms?.thirty  ?? FALLBACK.thirty,
      fifteen:       pmms?.fifteen ?? FALLBACK.fifteen,
      tenYr:         ten           ?? FALLBACK.tenYr,
      medianPrice:   msp,
      existingSales: ehs,
      monthsSupply:  msa,
      permits:       permits,
      mortgageApps:  FALLBACK.mortgageApps, // MBA WAS is paywalled; no free public feed
    },
    series52w: pmms?.series52w ?? generateFallbackSeries(),
    fredKeyConfigured: !!process.env.FRED_API_KEY,
  };
}

function generateFallbackSeries(): RatePoint[] {
  // Approximation of the path Apr 2025 → Apr 2026 used in the early UI
  const thirty = [
    6.63, 6.71, 6.78, 6.85, 6.79, 6.64, 6.55, 6.43, 6.38, 6.31, 6.28, 6.20,
    6.12, 6.07, 6.04, 6.01, 6.08, 6.15, 6.22, 6.29, 6.27, 6.20, 6.14, 6.05,
    5.97, 5.93, 5.99, 6.05, 6.01, 5.95, 6.07, 6.18, 6.26, 6.31, 6.33, 6.28,
    6.20, 6.13, 6.05, 5.97, 5.92, 5.96, 6.04, 6.11, 6.16, 6.10, 6.02, 5.96,
    5.90, 5.92, 5.96, 5.84,
  ];
  const fifteen = thirty.map((t) => +(t - 0.65).toFixed(2));
  const today = new Date();
  return thirty.map((t, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - 7 * (thirty.length - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      thirty: t,
      fifteen: fifteen[i],
    };
  });
}
