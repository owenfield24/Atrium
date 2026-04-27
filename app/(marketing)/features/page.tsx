import Link from "next/link";

const sections = [
  {
    id: "command",
    eyebrow: "Module 01",
    title: "Transaction Command Center",
    body: "Pipelines for buyers and sellers, critical-date timers, document checklists, shared client portals on every deal. Drag a card to advance the stage; the AI updates downstream tasks.",
    bullets: ["Buyer & seller pipelines", "Document vault with audit trail", "Co-agent + assistant permissions (row-level)", "Per-deal client portal"],
  },
  {
    id: "ai-cos",
    eyebrow: "Module 02",
    title: "AI Chief of Staff",
    body: "Morning briefing, prioritized daily action list, voice-note-to-CRM, stalled-deal alerts. Built on Claude Sonnet 4.6 for reasoning and Haiku 4.5 for fast tasks. Never logs PII to prompts.",
    bullets: ["Daily action list, ranked", "Voice memo → CRM in seconds", "Stalled-deal & re-engagement alerts", "Fair-Housing-filtered listing copy"],
  },
  {
    id: "pipeline",
    eyebrow: "Module 03",
    title: "Pipeline & Commission Forecaster",
    body: "Weighted pipeline, GCI tracking, split + cap calculator, source-ROI analytics. Replaces a wall of spreadsheets with a single source of truth.",
    bullets: ["Weighted forecast by stage probability", "Per-agent split, cap, post-cap math", "Source ROI with cost-per-close", "Quarter / year-end exports"],
  },
  {
    id: "sphere",
    eyebrow: "Module 04",
    title: "Sphere & Past-Client Vault",
    body: "Lifetime contact database, automated anniversary/birthday touches, predictive seller alerts. Past clients are 7× more likely to refer when you stay top of mind.",
    bullets: ["Lifetime contact database", "Anniversary / birthday automations", "Predictive seller alerts (7-yr cycle)", "Holiday + market-update sends"],
  },
  {
    id: "studio",
    eyebrow: "Module 05",
    title: "Marketing & Listing Studio",
    body: "Auto-generated listing graphics, AI listing descriptions (Fair-Housing filtered), social scheduler, landing pages, open-house mode. Every listing is also a marketing asset.",
    bullets: ["AI listing descriptions (with FH filter)", "Branded social posts per listing", "One-page landing per listing", "Open-house mode for iPad sign-in"],
  },
  {
    id: "keystone",
    eyebrow: "Module 06",
    title: "Keystone — Property Management",
    body: "For landlords and small property managers running 1–50 long-term or mid-term units. The middle market AppFolio and Buildium are too big for, and Hostfully is too short-term for.",
    bullets: ["Building → unit → tenant data model", "Lease tracking + rent roll + renewals", "Maintenance tickets + vendor directory", "Tenant screening (TransUnion / RentPrep)"],
  },
  {
    id: "insights",
    eyebrow: "Bonus",
    title: "Atrium Insights — DFW data depth",
    body: "Aggregated MLS, public records, building permits, BTR pipeline, off-market signals — by ZIP. National platforms can't compete on local depth; DFW specialization is the moat.",
    bullets: ["MLS + permits + tax-roll joins", "BTR pipeline by ZIP", "Off-market intent signals", "Solo / Pro / Fund pricing"],
  },
];

const compliance = [
  { title: "Listing brokerage attribution", body: "On every listing card and detail page, in font no smaller than the median text. (NAR policy 2021.)" },
  { title: "Listing agent + firm",          body: "Agent name plus firm phone or email visible in a reasonably prominent location." },
  { title: "Public remarks only",            body: "Confidential MLS agent remarks are filtered out of all consumer-facing surfaces." },
  { title: "Active statuses only",           body: "Consumer views limited to A, AO, AK, AC. No expired, withdrawn, or sold-only." },
  { title: "Internet-Display = Yes",         body: "Listings flagged No-Internet are suppressed. Office-Exclusive Exempt + Delayed Marketing Exempt honored." },
  { title: "Audit trail + per-user auth",    body: "Every consumer view, search, and share is logged. No password sharing — each user has their own credentials." },
];

export default function Features() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Features</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight text-slate-900 max-w-3xl">
          Six modules that replace nine separate tools.
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          Each module is built to be useful on its own and powerful together. Skylight gets module 1, 2,
          and 5 essentials. Atrium and Foundation get the whole stack.
        </p>
      </section>

      {sections.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`py-16 ${i % 2 === 0 ? "bg-white" : "bg-slate-50 border-y border-slate-200"}`}
        >
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className={i % 2 === 0 ? "" : "lg:order-2"}>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">{s.eyebrow}</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">{s.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{s.body}</p>
              <ul className="mt-5 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 flex-shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <FeatureMock id={s.id} />
          </div>
        </section>
      ))}

      {/* IDX compliance */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Compliance, built in</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold max-w-3xl">
            Every consumer-facing pixel respects NAR's IDX rules.
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl">
            We render the right fields and disclaimers automatically — your MLS attribution, your listing-agent
            disclosures, the right status filters, and a full audit log if your MLS ever asks.
          </p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compliance.map((c) => (
              <div key={c.title} className="rounded-xl bg-slate-800/60 border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-amber-400">{c.title}</h3>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">See it in motion.</h2>
        <p className="mt-3 text-slate-600">A live demo dashboard — no signup required.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-lg">Open the dashboard</Link>
          <Link href="/pricing" className="border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold px-5 py-3 rounded-lg">See pricing</Link>
        </div>
      </section>
    </div>
  );
}

function FeatureMock({ id }: { id: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/40 border border-slate-200 p-6 aspect-[4/3] flex items-center justify-center">
      <div className="text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">module preview</span>
        <p className="mt-2 text-2xl font-bold text-slate-700 capitalize">{id.replace(/-/g, " ")}</p>
        <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
          Animated preview lives in the demo dashboard.
        </p>
      </div>
    </div>
  );
}
