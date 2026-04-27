import Link from "next/link";

export default function About() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">About Atrium</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight text-slate-900">
          A software company, not a brokerage.
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed">
          An atrium is the central, light-filled space at the heart of a building — the place around which
          everything else organizes. That is the brand promise. Real estate today is fragmented: agents juggle
          six to nine disconnected tools, brokerages run on margins thin enough that they can't afford modern
          back office, and clients experience a transaction that feels stitched together rather than designed.
        </p>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Atrium is the hub: a single, well-lit central space where the data, the people, the transaction,
          and the moment of moving meet.
        </p>
      </section>

      <section id="story" className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pillars</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Four ideas the company orbits.</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {[
              { t: "Light",          d: "Transparency in pricing, in commission, in what we know. No hidden fees, plain-English contracts, public market data." },
              { t: "Hub",            d: "One central place where everything for a transaction or a brokerage operation converges. Fewer tools, more leverage." },
              { t: "Built in Texas", d: "Not a Silicon Valley import. Local people, local expertise, local accountability." },
              { t: "For independents", d: "Independent agents and small brokerages are not an afterthought — they are the customer." },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl bg-white border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{p.t}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Strategy</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">SaaS, multi-state from day one.</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-5">
          {[
            { t: "30–45 day onboarding", d: "From entity formation to a live MLS feed. The brokerage path is 90–110." },
            { t: "All 50 states",        d: "One Delaware C-Corp, no per-state license burden. Standard SaaS sales-tax nexus applies once thresholds cross." },
            { t: "Bridge & Trestle",      d: "We integrate via the platforms most early-stage real-estate SaaS uses, then layer in direct MLS licenses where scale justifies." },
          ].map((p) => (
            <div key={p.t} className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900">{p.t}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Where we stand</p>
          <blockquote className="mt-3 text-3xl font-medium leading-snug">
            “Atrium is a Fort Worth-built real estate company designed for independent operators —
            small enough to give every client white-glove service, smart enough to outperform brokerages
            five times our size.”
          </blockquote>
          <p className="mt-4 text-sm text-slate-400">— Atrium positioning statement, April 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Want to talk?</h2>
        <p className="mt-3 text-slate-600">
          We're running discovery calls with brokerage owners and operations leaders ahead of design-partner cohorts.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-lg">Open the dashboard</Link>
          <a href="mailto:hello@atrium.so" className="border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold px-5 py-3 rounded-lg">hello@atrium.so</a>
        </div>
      </section>
    </div>
  );
}
