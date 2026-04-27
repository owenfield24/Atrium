import Link from "next/link";
import { pricingTiers } from "@/lib/saas/data";

const ancillary = [
  { name: "Transaction coordination",   price: "$495 / tx · or $1,800 / mo unlimited", note: "Sticky as glue. Once Atrium handles the files, brokerages don't leave." },
  { name: "Listing media (photo + drone + video)", price: "$399 standard · $899 luxury", note: "Sold to agents at any DFW brokerage — public-facing brand engine." },
  { name: "Closing-day experience",     price: "$250–500 / close",                     note: "Champagne, gift basket, welcome-home photo, social-share kit." },
  { name: "Atrium Academy (90-day cohort)", price: "$1,500–2,500 / cohort",            note: "Recruiting pipeline + revenue. Texas adds thousands of new licensees yearly." },
  { name: "Pre-listing renovation finance", price: "7% fee at close",                  note: "Lender partnership; Curbio/Revive at regional scale." },
  { name: "Atrium Insights — DFW data",  price: "$99 · $299 · $999 / mo",              note: "Solo · Pro · Fund tiers. Permits, MLS, BTR pipeline, off-market." },
];

export default function Pricing() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pricing</p>
        <h1 className="mt-2 text-5xl font-bold text-slate-900 tracking-tight">Simple, tier-based.</h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl">
          Each tier maps to a real workflow shape — from solo agent to multi-office brokerage,
          plus a dedicated landlord/PM tier.
        </p>
      </section>

      {/* Tiers */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-5 gap-4">
        {pricingTiers.map((t) => (
          <div
            key={t.id}
            className={`rounded-2xl bg-white border p-6 flex flex-col ${
              t.highlight ? "border-amber-400 shadow-xl shadow-amber-200/40" : "border-slate-200"
            }`}
          >
            {t.highlight && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                Most popular
              </p>
            )}
            <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.blurb}</p>
            <div className="mt-4 mb-1">
              <span className="text-3xl font-bold text-slate-900">${t.price}</span>
              <span className="text-xs text-slate-500"> {t.unit}</span>
            </div>
            <ul className="mt-4 space-y-2 flex-1">
              {t.features.map((f) => (
                <li key={f} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-emerald-500 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className={`mt-5 text-center text-sm font-semibold py-2.5 rounded-lg ${
                t.highlight
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* Ancillary */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Ancillary services</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">À la carte revenue lines.</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Sold to Atrium customers and to agents at other brokerages. Used by the brokerage
            track to fund product development.
          </p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ancillary.map((a) => (
              <div key={a.name} className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900">{a.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{a.note}</p>
                <p className="text-sm font-mono text-amber-700 mt-3">{a.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer-side experiment */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Buyer-side experiment</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Three pricing paths for buyers, post-NAR settlement.</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          With written buyer-broker agreements now required and offers of compensation off MLS,
          here are three paths Atrium customers can A/B in their market.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {[
            { t: "Traditional", p: "2–3% buy-side commission", n: "Paid by seller when offered, by buyer when not. Easy to explain." },
            { t: "Membership",  p: "$99 / mo + $2,500 at close", n: "Cancel anytime. Differentiator for sophisticated buyers; aligns with the buyer." },
            { t: "Flat-fee",    p: "$4,995 ≤ $750k · $7,995 above", n: "Predictable, simple to advertise, legally clean post-settlement." },
          ].map((c) => (
            <div key={c.t} className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900">{c.t}</h3>
              <p className="text-amber-700 font-mono text-sm mt-2">{c.p}</p>
              <p className="text-sm text-slate-600 mt-3">{c.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">FAQ</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">A few common questions.</h2>
        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {[
            { q: "Do I need a brokerage license to use Atrium?",
              a: "No. Atrium is a SaaS productivity tool for licensed agents and brokerages. The compliance burden lives with our customer (the broker), not with us." },
            { q: "How do you connect to MLS data?",
              a: "Through Bridge Interactive (Zillow Group) and Trestle (CoreLogic). Each broker customer authorizes Atrium as a technical vendor in 5 minutes; the MLS reviews in 5–10 business days." },
            { q: "Which markets are you live in?",
              a: "DFW (NTREIS), Houston (HAR), CRMLS (CA), Stellar (FL), Bright (DC/MD/VA/DE/NJ/PA/WV) — covering several hundred thousand subscribers. Austin (ABOR) and SABOR are in onboarding." },
            { q: "Is there a per-state license fee?",
              a: "No. Atrium is one Delaware C-Corp serving all 50 states. Standard SaaS sales-tax nexus applies once revenue thresholds cross — handled via Anrok / Stripe Tax." },
            { q: "What's the Keystone tier?",
              a: "A property-management track for landlords with 1–50 long-term or mid-term units. Building → unit → tenant data model. Atrium tracks deposits but never holds funds — money movement integrates with Stripe / Plaid / Baselane." },
            { q: "How long until I'm in my dashboard?",
              a: "30–45 days from kickoff to a live MLS feed. Faster if your brokerage's vendor-authorization is already in Bridge or Trestle." },
          ].map((f) => (
            <details key={f.q} className="py-5 group">
              <summary className="cursor-pointer flex items-center justify-between text-slate-900 font-medium text-base list-none">
                {f.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
