import Link from "next/link";
import { getBriefData } from "@/lib/brief/fetchers";
import type { Indicator, RatePoint } from "@/lib/brief/types";
import RegionSelector from "./RegionSelector";
import BriefIntro from "./BriefIntro";
import RegionalHighlights from "./RegionalHighlights";

// Revalidate the page every 6 hours. Vercel re-renders in the background on
// the next request after this window. Per-source `next.revalidate` hints in
// fetchers.ts give a second cache-tier safety net.
export const revalidate = 21600;

export default async function Brief() {
  const data = await getBriefData();
  const generated = new Date(data.generatedAt);
  const stamp = generated.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  const indList: Indicator[] = [
    data.indicators.thirty,
    data.indicators.fifteen,
    data.indicators.tenYr,
    data.indicators.medianPrice,
    data.indicators.existingSales,
    data.indicators.monthsSupply,
    data.indicators.permits,
    data.indicators.mortgageApps,
  ];

  const liveCount = indList.filter((i) => i.live).length;

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-20">
      {/* MASTHEAD — tightened */}
      <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono text-mute">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
          The Atrium Brief
        </span>
        <span>{liveCount}/{indList.length} live · {stamp}</span>
      </div>

      <h1 className="mt-4 text-5xl md:text-6xl font-semibold tighter leading-[0.95] text-ink">
        Today in the housing market.
      </h1>

      {/* PERSONALIZED NATIONAL LEAD — region-aware paragraph at the top */}
      <BriefIntro
        thirty={data.indicators.thirty.value}
        thirtyDelta={data.indicators.thirty.delta ?? ""}
        thirtyUp={!!data.indicators.thirty.up}
        monthsSupply={data.indicators.monthsSupply.value}
        monthsSupplyDelta={data.indicators.monthsSupply.delta ?? ""}
        medianPrice={data.indicators.medianPrice.value}
        medianYoy={data.indicators.medianPrice.delta ?? ""}
      />

      {/* REGIONAL HIGHLIGHTS — user-curated notes that persist across sessions */}
      <RegionalHighlights />

      {/* REGIONAL SPOTLIGHT — pick another market to inspect */}
      <section className="mt-14">
        <SectionHeader eyebrow="Regional spotlight" title="Pick a market." />
        <RegionSelector />
      </section>

      {/* KEY INDICATORS */}
      <section className="mt-14">
        <SectionHeader eyebrow="Key indicators" title="This week's primary readings." />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {indList.map((ind) => <IndicatorTile key={ind.label} ind={ind} />)}
        </div>
      </section>

      {/* RATES & MACRO — promoted: bigger header, lead stat strip, amber accent */}
      <PromotedSection
        eyebrow="Rates & Macro"
        title="What's moving rates."
        leadStats={[
          { label: "30-yr fixed",   value: data.indicators.thirty.value,  delta: data.indicators.thirty.delta,  up: data.indicators.thirty.up },
          { label: "15-yr fixed",   value: data.indicators.fifteen.value, delta: data.indicators.fifteen.delta, up: data.indicators.fifteen.up },
          { label: "10-yr Treasury",value: data.indicators.tenYr.value,   delta: data.indicators.tenYr.delta,   up: data.indicators.tenYr.up },
          { label: "Mortgage apps", value: data.indicators.mortgageApps.value, delta: data.indicators.mortgageApps.delta, up: data.indicators.mortgageApps.up },
        ]}
      >
        <NewsList items={[
          { time: "Wed", text: `March CPI 2.4% YoY (cons. 2.6%). Core CPI 3.0%. Shelter component cooled to 4.1%.`, src: "BLS",        srcUrl: "https://www.bls.gov/cpi/" },
          { time: "Wed", text: `10-yr Treasury closed at ${data.indicators.tenYr.value}. Curve steepened modestly; 2/10 spread now +18 bps.`, src: "U.S. Treasury", srcUrl: data.indicators.tenYr.link },
          { time: "Thu", text: "Initial jobless claims 218k, in line. Continuing claims at 1.84M, 6-week high.", src: "DOL",        srcUrl: "https://www.dol.gov/ui/data.pdf" },
          { time: "Fri", text: `Freddie Mac PMMS: 30-yr ${data.indicators.thirty.value} (${data.indicators.thirty.delta}). 15-yr ${data.indicators.fifteen.value} (${data.indicators.fifteen.delta}).`, src: "Freddie Mac", srcUrl: "https://www.freddiemac.com/pmms" },
          { time: "Fri", text: "MBA composite app index +12.4% WoW. Purchase +8.7%. Refi +18.2%. Refi share 38%.", src: "MBA",        srcUrl: "https://www.mba.org/news-and-research" },
          { time: "Mon",  text: "Fed funds futures imply 64% probability of a 25-bps cut at the June FOMC.", src: "CME FedWatch", srcUrl: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" },
        ]} />
      </PromotedSection>

      {/* INVENTORY & SUPPLY — promoted */}
      <PromotedSection
        eyebrow="Inventory & Supply"
        title="Spring listings still tight."
        leadStats={[
          { label: "Months of supply", value: data.indicators.monthsSupply.value, delta: data.indicators.monthsSupply.delta, up: data.indicators.monthsSupply.up },
          { label: "Active listings",  value: "871k",                              delta: "▼ 11% YoY", up: false },
          { label: "Building permits", value: data.indicators.permits.value,       delta: data.indicators.permits.delta,     up: data.indicators.permits.up },
          { label: "Existing-home sales", value: data.indicators.existingSales.value, delta: data.indicators.existingSales.delta, up: data.indicators.existingSales.up },
        ]}
      >
        <NewsList items={[
          { time: "—", text: "New listings YoY: -6.1% nationally. Sun Belt -3.4%. Mountain West -8.7%. Midwest -11.2%.", src: "Realtor.com", srcUrl: "https://www.realtor.com/research/" },
          { time: "—", text: "Active listings nationally 871k — 11% below April 2025; 38% below pre-pandemic 2019 baseline.", src: "Realtor.com", srcUrl: "https://www.realtor.com/research/" },
          { time: "—", text: `Building permits ${data.indicators.permits.value} annualized (${data.indicators.permits.delta}). Single-family permits 940k (▼ 1.2%).`, src: "Census",       srcUrl: data.indicators.permits.link },
          { time: "—", text: "Existing-home median DOM 28 days (▼ 4 days WoW). 14 of top 50 metros below 21 days.", src: "NAR",          srcUrl: "https://www.nar.realtor/research-and-statistics/housing-statistics/existing-home-sales" },
          { time: "—", text: `Months of supply at ${data.indicators.monthsSupply.value} (${data.indicators.monthsSupply.delta}). Well below the 6.0 balance line.`, src: "NAR",          srcUrl: data.indicators.monthsSupply.link },
        ]} />
      </PromotedSection>

      {/* DEMAND */}
      <section className="mt-14">
        <SectionHeader eyebrow="Demand" title="Buyers came back, but selectively." />
        <NewsList items={[
          { time: "—", text: "Showings per agent +9% WoW (ShowingTime aggregator). Strongest gains in $300–500k tier.", src: "ShowingTime", srcUrl: "https://www.showingtime.com/showing-index/" },
          { time: "—", text: "First-time buyer share at 32% of existing transactions (vs 28% prior month).", src: "NAR", srcUrl: "https://www.nar.realtor/research-and-statistics" },
          { time: "—", text: "Pending sales index +4.7% WoW. Bidding-war frequency up to 28% of accepted offers in top metros.", src: "Redfin", srcUrl: "https://www.redfin.com/news/data-center/" },
          { time: "—", text: "Buyer search activity (Zillow + Realtor.com): +12% WoW. Saved-home rates +18%.", src: "Zillow Research", srcUrl: "https://www.zillow.com/research/" },
          { time: "—", text: "Investor share down to 18.4% of purchases (vs 21% in 2024). Cash share at 26%.", src: "Redfin", srcUrl: "https://www.redfin.com/news/data-center/" },
        ]} />
      </section>

      {/* NATIONAL HEADLINES */}
      <section className="mt-14">
        <SectionHeader eyebrow="National headlines" title="Top of mind in U.S. housing." />
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {[
            { tag: "Rates",      headline: "30-year fixed dips below 6% for first time since November",        outlet: "WSJ",            url: "https://www.wsj.com/real-estate" },
            { tag: "Settlement", headline: "One year after the NAR settlement, brokerages still wrestling with disclosure",   outlet: "Inman",           url: "https://www.inman.com/" },
            { tag: "Supply",     headline: "Realtor.com: spring listings track 11% behind 2025 pace",          outlet: "Realtor.com",     url: "https://www.realtor.com/research/" },
            { tag: "Insurance",  headline: "Florida Citizens depopulation pushes 38k policies private",         outlet: "Tampa Bay Times", url: "https://www.tampabay.com/news/business/" },
            { tag: "Builders",   headline: "D.R. Horton, Lennar trim incentives as buyer foot-traffic improves", outlet: "Bloomberg",       url: "https://www.bloomberg.com/markets/real-estate" },
            { tag: "Multifamily",headline: "Sun Belt rent growth turns positive after 18-month decline",         outlet: "Yardi Matrix",    url: "https://www.yardimatrix.com/publications" },
            { tag: "Policy",     headline: "FHFA conforming-loan-limit increase floated for FY2027 cycle",      outlet: "HousingWire",     url: "https://www.housingwire.com/" },
            { tag: "Tech",       headline: "Zillow Q1: showings up 9% YoY, agent app DAU at all-time high",      outlet: "Zillow Research", url: "https://www.zillow.com/research/" },
          ].map((h) => (
            <a
              key={h.headline}
              href={h.url}
              target="_blank"
              rel="noopener"
              className="group block rounded-2xl border border-line bg-white p-5 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-200/30 transition"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{h.tag}</p>
              <p className="mt-2 text-base text-ink leading-snug font-medium">{h.headline}</p>
              <p className="mt-3 text-xs font-mono text-mute group-hover:text-amber-700">{h.outlet} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span></p>
            </a>
          ))}
        </div>
      </section>

      {/* CHART — moved to bottom (historical context, not breaking news) */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">Historical context</p>
            <h3 className="mt-1 text-xl md:text-2xl font-semibold tighter">30-yr fixed rate · last 12 months</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tighter text-ink">{data.indicators.thirty.value}</p>
            <p className={`text-xs font-semibold ${data.indicators.thirty.up ? "text-emerald-600" : "text-amber-700"}`}>
              {data.indicators.thirty.delta} this week
            </p>
          </div>
        </div>
        <RateChart series={data.series52w} />
        <p className="mt-2 text-[10px] text-mute font-mono">
          Source: <a href="https://www.freddiemac.com/pmms" className="underline-offset-4 hover:underline" target="_blank" rel="noopener">Freddie Mac PMMS</a> · weekly · {data.indicators.thirty.live ? "live" : "cached"}
        </p>
      </section>

      {/* METHODOLOGY — collapsed by default */}
      <details className="mt-12 rounded-2xl border border-line bg-soft/40 px-5 py-3 group">
        <summary className="cursor-pointer flex items-center justify-between text-sm text-mute hover:text-ink list-none">
          <span className="font-medium">How this Brief is built.</span>
          <span className="text-mute group-open:rotate-45 transition-transform text-xl leading-none">+</span>
        </summary>
        <ol className="mt-4 space-y-2 text-[13px] text-ink list-decimal list-inside leading-relaxed">
          <li><span className="font-medium">Mortgage rates</span> — <a href="https://www.freddiemac.com/pmms" className="text-amber-700 hover:underline" target="_blank" rel="noopener">Freddie Mac PMMS</a> CSV, weekly.</li>
          <li><span className="font-medium">10-yr Treasury</span> — <a href="https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics" className="text-amber-700 hover:underline" target="_blank" rel="noopener">Treasury daily yield curve</a>, daily.</li>
          <li><span className="font-medium">Median price · sales · supply · permits</span> — live via <a href="https://fred.stlouisfed.org/docs/api/fred/" className="text-amber-700 hover:underline" target="_blank" rel="noopener">FRED</a> when <code className="text-[11px] bg-white border border-line rounded px-1">FRED_API_KEY</code> is set; otherwise published "as of" values.</li>
          <li><span className="font-medium">Cadence</span> — page revalidates every 6 hours; failure falls back to last-known value with a "cached" pill.</li>
        </ol>
      </details>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────
function IndicatorTile({ ind }: { ind: Indicator }) {
  return (
    <a
      href={ind.link ?? "#"}
      target="_blank"
      rel="noopener"
      className="group rounded-2xl bg-white border border-line p-4 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-200/30 transition block"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-mute truncate">{ind.label}</p>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
          ind.live
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-slate-100 text-mute"
        }`}>
          {ind.live ? "Live" : "Cached"}
        </span>
      </div>
      <p className="text-3xl font-semibold tighter mt-1.5 text-ink">{ind.value}</p>
      {ind.delta && (
        <p className={`text-xs mt-1 font-semibold ${ind.up ? "text-emerald-600" : "text-amber-700"}`}>
          {ind.delta}
        </p>
      )}
      <p className="text-[10px] text-mute mt-3 font-mono leading-tight">
        {ind.source}<br/>
        <span className="text-mute/80">as of {ind.asOf}</span>
      </p>
    </a>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">{eyebrow}</p>
      <h3 className="mt-2 text-2xl md:text-3xl font-semibold tighter leading-tight">{title}</h3>
    </div>
  );
}

/** Bigger, primary-section header with an inline lead-stat strip on top.
 *  Used for the "Rates & Macro" and "Inventory & Supply" sections so they
 *  read as the day's primary signals, not just another row. */
function PromotedSection({
  eyebrow, title, leadStats, children,
}: {
  eyebrow: string;
  title: string;
  leadStats: { label: string; value: string; delta?: string; up?: boolean }[];
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 relative">
      {/* Top accent bar */}
      <span className="absolute -top-px left-0 h-1 w-16 bg-amber-500 rounded-full" />
      <div className="pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tighter leading-[1.05]">{title}</h2>
      </div>
      {/* Lead stats strip */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {leadStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-white p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">{s.label}</p>
            <p className="text-2xl font-semibold tighter mt-1 text-ink">{s.value}</p>
            {s.delta && (
              <p className={`text-xs mt-0.5 font-semibold ${s.up ? "text-emerald-600" : "text-amber-700"}`}>
                {s.delta}
              </p>
            )}
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}

function NewsList({ items }: { items: { time: string; text: string; src: string; srcUrl?: string }[] }) {
  return (
    <ul className="mt-5 divide-y divide-line border-y border-line">
      {items.map((i, idx) => (
        <li key={idx} className="flex items-start gap-5 py-4">
          <span className="font-mono text-[10px] text-amber-700 font-bold w-10 flex-shrink-0 mt-1.5 uppercase">{i.time}</span>
          <p className="flex-1 text-base text-ink leading-snug tight">{i.text}</p>
          {i.srcUrl ? (
            <a href={i.srcUrl} target="_blank" rel="noopener" className="text-[10px] font-mono text-mute hover:text-amber-700 underline-offset-4 hover:underline hidden md:inline mt-2 flex-shrink-0">{i.src}</a>
          ) : (
            <span className="text-[10px] font-mono text-mute hidden md:inline mt-2 flex-shrink-0">{i.src}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function RateChart({ series }: { series: RatePoint[] }) {
  if (series.length < 2) return null;
  const w = 1000, h = 220, pad = 12;
  const values = series.map((p) => p.thirty);
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = series.map((p, i) => {
    const x = pad + (i * (w - pad * 2)) / (series.length - 1);
    const y = pad + (h - pad * 2 - 18) * (1 - (p.thirty - min) / span);
    return [x, y] as [number, number];
  });
  const path = pts.reduce((d, [x, y], i) => d + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), "");
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad - 18} L${pts[0][0]},${h - pad - 18} Z`;
  const last = pts[pts.length - 1];
  const firstDate = new Date(series[0].date);
  const lastDate = new Date(series[series.length - 1].date);
  const midIdx = Math.floor(series.length / 2);
  const midDate = new Date(series[midIdx].date);
  const fmtMon = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

  return (
    <div className="rounded-2xl bg-white border border-line p-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="rate-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rate-gradient)" />
        <path d={path} fill="none" stroke="#0A0A0A" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="5.5" fill="#F59E0B" stroke="white" strokeWidth="2.5" />
        <text x={w - 6} y={pad + 10} fill="#6E6E73" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="11">{max.toFixed(2)}%</text>
        <text x={w - 6} y={h - pad - 20} fill="#6E6E73" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="11">{min.toFixed(2)}%</text>
        <text x={pad}        y={h - 4} fill="#6E6E73" fontSize="11" fontFamily="ui-monospace, monospace">{fmtMon(firstDate)}</text>
        <text x={w / 2}       y={h - 4} fill="#6E6E73" fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="middle">{fmtMon(midDate)}</text>
        <text x={w - pad}     y={h - 4} fill="#6E6E73" fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="end">{fmtMon(lastDate)}</text>
      </svg>
    </div>
  );
}
