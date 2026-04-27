import Link from "next/link";
import { mlsConnections, pricingTiers } from "@/lib/saas/data";
import { fmtNum } from "@/lib/utils";

export default function Landing() {
  const totalSubs = mlsConnections.reduce((s, m) => s + m.subscribers, 0);
  const live = mlsConnections.filter((m) => m.status === "Live").length;

  return (
    <div className="pt-24">
      {/* HERO — split: huge type left, Mac-window mockup right */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[44rem] h-[44rem] bg-amber-200/40 blur-3xl rounded-full -z-10" />
        <div className="absolute top-1/3 -left-40 w-[28rem] h-[28rem] bg-amber-100/50 blur-3xl rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              A new operating system for independent real estate teams.
            </div>
            <h1 className="mt-6 text-6xl md:text-7xl xl:text-8xl font-semibold tighter leading-[0.9] text-ink">
              A calmer way<br />
              to run a <span className="relative inline-block">
                brokerage.
                <span className="absolute -bottom-1 left-0 right-0 h-2 bg-amber-300/70 -z-10 rounded" />
              </span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-mute leading-snug tight max-w-md">
              Pipeline, past clients, paperwork, marketing, and your next move.
              One place. One bill. One AI that tells you what to do today.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/dashboard" className="bg-ink text-white text-base font-medium px-7 py-3.5 rounded-full hover:bg-mute shadow-lg shadow-black/5">
                Try the dashboard
              </Link>
              <Link href="/pricing" className="text-base text-ink font-medium px-7 py-3.5 rounded-full border border-line hover:border-amber-400 hover:bg-amber-50 transition-colors">
                See pricing
              </Link>
            </div>
          </div>

          {/* MAC WINDOW MOCKUP */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300/30 to-amber-200/10 blur-2xl rounded-[2.5rem]" />
            <div className="relative bg-white rounded-[1.6rem] border border-line shadow-2xl shadow-black/10 overflow-hidden">
              {/* Window chrome */}
              <div className="bg-soft px-5 py-3 flex items-center gap-1.5 border-b border-line">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 flex justify-center">
                  <span className="text-xs text-mute font-mono bg-white border border-line rounded-full px-3 py-0.5">
                    atrium.so / dashboard
                  </span>
                </div>
              </div>
              {/* Window body — three stat tiles */}
              <div className="p-5 grid grid-cols-3 gap-3">
                {[
                  { l: "Active deals",   v: "11",    s: "+3 this week",  bg: "bg-white",        accent: "text-emerald-600" },
                  { l: "Forecast GCI",   v: "$486k", s: "Q2 weighted",   bg: "bg-amber-50",     accent: "text-amber-700",   ring: "ring-1 ring-amber-200" },
                  { l: "Match score",    v: "82%",   s: "Jennifer W.",   bg: "bg-white",        accent: "text-ink" },
                ].map((s) => (
                  <div key={s.l} className={`rounded-xl border border-line p-3 ${s.bg} ${s.ring ?? ""}`}>
                    <p className="text-[10px] font-semibold text-mute uppercase tracking-wider">{s.l}</p>
                    <p className={`text-2xl font-semibold tighter mt-1 ${s.accent}`}>{s.v}</p>
                    <p className="text-[10px] text-mute mt-0.5">{s.s}</p>
                  </div>
                ))}
              </div>
              {/* Listing rows */}
              <div className="px-5 pb-5 space-y-2">
                {[
                  ["4821 Westbrook Lane",   "Active",  "$875k",  "92", "emerald"],
                  ["1103 Ridgecrest Drive", "Pending", "$1.25M", "78", "amber"],
                  ["512 East 6th St #4B",   "Active",  "$445k",  "85", "emerald"],
                ].map(([addr, status, price, score, tone]) => (
                  <div key={String(addr)} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-soft hover:bg-amber-50/60 transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full ${tone === "amber" ? "bg-amber-500" : "bg-emerald-500"}`} />
                    <span className="flex-1 text-sm text-ink truncate">{String(addr)}</span>
                    <span className="text-xs text-mute">{String(status)}</span>
                    <span className="text-sm font-mono text-ink">{String(price)}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{String(score)}</span>
                  </div>
                ))}
              </div>
              {/* Footer line */}
              <div className="px-5 py-2.5 border-t border-line bg-soft flex items-center justify-between">
                <span className="text-[10px] font-mono text-mute">Live · NTREIS · 5 MLS feeds</span>
                <span className="text-[10px] font-semibold text-amber-700">Open dashboard →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP — amber-accented */}
      <section className="border-y border-line bg-gradient-to-b from-amber-50/40 via-white to-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-x-12 text-center">
          {[
            { v: `${fmtNum(totalSubs)}+`,                 l: "MLS subscribers reachable", hl: true },
            { v: "30–45 days",                             l: "From signup to first MLS feed" },
            { v: `${live} of ${mlsConnections.length}`,    l: "MLS markets live", hl: true },
            { v: "50",                                      l: "States, no per-state license" },
          ].map((s) => (
            <div key={s.l}>
              <p className={`text-4xl md:text-5xl font-semibold tighter ${s.hl ? "text-amber-700" : "text-ink"}`}>{s.v}</p>
              <p className="mt-2 text-sm text-mute">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCROLL CHAPTER 1 — Brief */}
      <Chapter
        eyebrow="The Brief"
        title="Wake up to one paragraph that tells you the day."
        body="The AI Chief of Staff reads your pipeline, your calendar, your inbox, and your MLS feeds — then writes a 30-second briefing of what matters today. Open the dashboard once. Close it ten minutes later."
        cta={{ href: "/dashboard", label: "Open the dashboard" }}
      >
        <BriefMock />
      </Chapter>

      {/* SCROLL CHAPTER 2 — Pipeline */}
      <Chapter
        eyebrow="Pipeline"
        title="Every deal, every stage, in one quiet place."
        body="A board for buyers and sellers. Critical-date timers. Document checklists. Client portals. Permissions row-level by role — owner, co-agent, assistant, broker, client."
        cta={{ href: "/transactions", label: "See the pipeline" }}
        flip
      >
        <PipelineMock />
      </Chapter>

      {/* SCROLL CHAPTER 3 — Keystone */}
      <Chapter
        eyebrow="Keystone"
        title="The same calm interface for landlords with one duplex or fifty doors."
        body="Building → unit → tenant. Lease tracking. Maintenance. Renters' insurance verification. Fair-Housing-aware screening. Without ever holding tenant funds."
        cta={{ href: "/keystone", label: "Open Keystone" }}
      >
        <KeystoneMock />
      </Chapter>

      {/* SIX MODULES — v2 substance, rendered as a calm grid */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-sm text-mute">Six modules, one hub.</p>
            <h2 className="mt-3 text-5xl md:text-6xl font-semibold tighter leading-[0.95]">
              Replace nine tools <br /> with one.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { tag: "01", t: "Transaction Command Center",      d: "Pipelines for buyers and sellers, critical dates, document checklists, shared client portals." },
              { tag: "02", t: "AI Chief of Staff",                d: "Morning briefing, prioritized action list, voice-note→CRM, stalled-deal alerts." },
              { tag: "03", t: "Pipeline & Commission Forecaster", d: "Weighted pipeline, GCI tracking, split + cap math, source ROI by channel." },
              { tag: "04", t: "Sphere & Past-Client Vault",       d: "Lifetime contact database, anniversary touches, predictive seller alerts." },
              { tag: "05", t: "Marketing & Listing Studio",       d: "AI listing copy (Fair-Housing filtered), social scheduler, landing pages, open-house mode." },
              { tag: "06", t: "Keystone — Property Management",   d: "Building → unit → tenant for landlords with 1–50 doors." },
            ].map((m) => (
              <div key={m.t} className="group relative rounded-3xl bg-white border border-line p-7 hover:shadow-xl hover:shadow-amber-200/40 hover:border-amber-400/60 transition">
                {/* Amber accent line on hover */}
                <span className="absolute left-7 top-0 h-1 w-12 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3">
                  <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-sm items-center justify-center">{m.tag}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold tighter">{m.t}</h3>
                <p className="mt-2 text-sm text-mute leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING — v2 substance, v7 calm tiles */}
      <section className="border-t border-line bg-soft">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-sm text-mute">Pricing</p>
            <h2 className="mt-3 text-5xl md:text-6xl font-semibold tighter leading-[0.95]">
              From solo agent <br /> to multi-office.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pricingTiers.map((t) => (
              <div
                key={t.id}
                className={`rounded-3xl bg-white p-7 border flex flex-col ${
                  t.highlight ? "border-ink shadow-2xl shadow-black/10" : "border-line"
                }`}
              >
                {t.highlight && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-mute mb-2">Most popular</p>
                )}
                <p className="text-base font-semibold tighter">{t.name}</p>
                <p className="text-xs text-mute mt-1">{t.blurb}</p>
                <p className="mt-6">
                  <span className="text-3xl font-semibold tighter">${t.price}</span>
                  <span className="text-xs text-mute"> {t.unit}</span>
                </p>
                <ul className="mt-4 space-y-1.5 flex-1">
                  {t.features.slice(0, 3).map((f) => (
                    <li key={f} className="text-xs text-mute">— {f}</li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`mt-5 block text-center text-sm font-medium py-2 rounded-full transition-colors ${
                    t.highlight ? "bg-ink text-white hover:bg-mute" : "bg-soft hover:bg-line"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-mute">
            <Link href="/pricing" className="underline-offset-4 hover:underline">See full feature comparison →</Link>
          </p>
        </div>
      </section>

      {/* CTA — v7 typography + v2 amber gradient */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="rounded-[2.5rem] bg-ink text-white px-10 md:px-16 py-20 md:py-24 relative overflow-hidden">
          {/* Amber wash pulled in from v2 CTA */}
          <div className="absolute inset-0 bg-gradient-to-l from-amber-500/35 via-amber-500/8 to-transparent" />
          <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-amber-500/40 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 right-10 w-80 h-80 bg-amber-400/25 blur-3xl rounded-full" />

          <div className="relative max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-semibold tighter leading-[0.9]">
              Less software. <br /> More moving day.
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-md">
              Open the live demo dashboard with seeded data — no signup, no card.
            </p>
            <div className="mt-10 flex gap-3">
              <Link href="/dashboard" className="bg-amber-500 hover:bg-amber-400 text-ink text-base font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/30">
                Try the dashboard
              </Link>
              <Link href="/pricing" className="text-base font-medium text-white border border-white/30 hover:border-white/60 bg-white/5 backdrop-blur px-7 py-3.5 rounded-full">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Chapter({
  eyebrow, title, body, cta, flip, children,
}: {
  eyebrow: string; title: string; body: string;
  cta: { href: string; label: string }; flip?: boolean; children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line">
      <div className={`max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <p className="text-sm text-mute">{eyebrow}</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tighter leading-[1.05]">{title}</h2>
          <p className="mt-5 text-lg text-mute leading-relaxed tight">{body}</p>
          <Link href={cta.href} className="inline-block mt-7 text-base font-medium text-ink underline-offset-4 hover:underline decoration-ink">
            {cta.label} →
          </Link>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function MacFrame({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-300/25 to-amber-100/10 blur-2xl rounded-[2rem]" />
      <div className="relative bg-white rounded-[1.4rem] border border-line shadow-2xl shadow-black/10 overflow-hidden">
        <div className="bg-soft px-4 py-2.5 flex items-center gap-1.5 border-b border-line">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 flex justify-center">
            <span className="text-[10px] text-mute font-mono bg-white border border-line rounded-full px-2.5 py-0.5">{title}</span>
          </div>
        </div>
        <div className={accent ?? ""}>{children}</div>
      </div>
    </div>
  );
}

function BriefMock() {
  return (
    <MacFrame title="atrium.so / brief">
      <div className="p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Wednesday · The Brief</p>
        <p className="mt-3 text-lg text-ink leading-relaxed tight">
          Three deals advance today. <span className="text-mute">Walk-through at 1103 Ridgecrest at 10. Marcus Chen's offer expires noon — confirm. Saturday open house at 4821 Westbrook — sign-in iPad ready by Friday EOD.</span>
        </p>
        <div className="mt-6 flex gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">3 actions</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-soft text-ink">2 closings this week</span>
        </div>
      </div>
    </MacFrame>
  );
}

function PipelineMock() {
  return (
    <MacFrame title="atrium.so / transactions">
      <div className="p-5">
        {[
          { stage: "Active Search",   n: 4, w: "30%", price: "$3.4M", color: "bg-ink" },
          { stage: "Offer",           n: 2, w: "55%", price: "$1.4M", color: "bg-amber-500" },
          { stage: "Under Contract",  n: 3, w: "75%", price: "$2.8M", color: "bg-amber-500" },
          { stage: "Closing",         n: 1, w: "92%", price: "$695k", color: "bg-emerald-500" },
        ].map((s) => (
          <div key={s.stage} className="py-3 border-b border-line last:border-b-0">
            <div className="flex justify-between text-sm">
              <span className="text-ink font-medium">{s.stage}</span>
              <span className="text-mute">{s.n} · {s.price}</span>
            </div>
            <div className="mt-2 h-1.5 bg-soft rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: s.w }} />
            </div>
          </div>
        ))}
      </div>
    </MacFrame>
  );
}

function KeystoneMock() {
  return (
    <MacFrame title="atrium.so / keystone">
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Buildings", v: "6",    bg: "bg-soft",       fg: "text-ink" },
            { label: "Units",     v: "12",   bg: "bg-soft",       fg: "text-ink" },
            { label: "Occupied",  v: "10",   bg: "bg-amber-50",   fg: "text-amber-700" },
            { label: "MRR",       v: "$28k", bg: "bg-amber-50",   fg: "text-amber-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 border border-line ${s.bg}`}>
              <p className={`text-3xl font-semibold tighter ${s.fg}`}>{s.v}</p>
              <p className="text-xs text-mute mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-white border border-amber-300 p-4 flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
          <div>
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Top action</p>
            <p className="text-sm text-ink mt-1">Renters' insurance expiring on Unit U-100B in 6 days</p>
          </div>
        </div>
      </div>
    </MacFrame>
  );
}
