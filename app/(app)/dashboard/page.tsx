"use client";

import { dashboardStats } from "@/lib/mls/data";
import { transactions, mlsConnections } from "@/lib/saas/data";
import { fmtCompact } from "@/lib/utils";
import { useProfile } from "@/lib/profile";
import { dailyQuote } from "@/lib/quotes";
import { useClients } from "@/lib/clients-store";

export default function DashboardPage() {
  const profile = useProfile();
  const clients = useClients();

  const role = profile?.role ?? "agent-solo";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const quote = dailyQuote();

  const firstName = profile?.firstName ?? "";

  return (
    <div className="max-w-6xl mx-auto pt-16 pb-24">
      {/* OPENING */}
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {today}
      </div>
      <h1 className="mt-5 text-6xl md:text-7xl font-semibold tighter leading-[0.95]">
        {firstName ? <>Good morning,<br />{firstName}.</> : <>Good morning.</>}
      </h1>

      {role === "agent-solo"   && <SoloAgentHero    clients={clients} />}
      {role === "agent-agency" && <AgencyHero       agency={profile?.agency} clients={clients} />}
      {role === "landlord"     && <LandlordHero     landlord={profile?.landlord} />}

      {/* DAILY QUOTE — editorial pull-quote: amber rule, italic, no card chrome */}
      <section className="mt-16">
        <figure className="relative pl-6 md:pl-8 border-l-2 border-amber-500 max-w-3xl">
          <figcaption className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">
            Reflection · {today}
          </figcaption>
          <blockquote className="mt-4 text-2xl md:text-3xl text-ink leading-snug tight italic font-light">
            {quote.quote}
          </blockquote>
          <figcaption className="mt-4 text-sm text-mute">— {quote.author}</figcaption>
        </figure>
      </section>

    </div>
  );
}

// ── Role-specific heroes ─────────────────────────────────────────────────
function SoloAgentHero({ clients }: { clients: { id: string }[] }) {
  const activeDeals = transactions.filter((t) => t.stage !== "Closed");
  const closingSoon = activeDeals.filter((t) => t.stage === "Under Contract" || t.stage === "Closing");
  const forecastGCI = activeDeals.reduce((s, t) => s + t.price * 0.025 * (t.pctDone / 100), 0);
  const liveMLS     = mlsConnections.filter((m) => m.status === "Live").length;

  return (
    <>
      <p className="mt-6 text-2xl text-mute tight max-w-3xl leading-snug">
        {closingSoon.length} closing this week. {activeDeals.length} active deals. {clients.length} clients to mind.
      </p>
      <div className="mt-14 grid md:grid-cols-2 gap-4">
        <BigStat label="Forecast GCI" value={fmtCompact(forecastGCI)} sub="weighted, this quarter" />
        <BigStatDark label="MLS feeds live" value={`${liveMLS}`} suffix={`/ ${mlsConnections.length}`} sub="across regions · NTREIS, HAR, CRMLS, Stellar, Bright" />
      </div>
    </>
  );
}

function AgencyHero({ agency, clients }: { agency?: { name: string; agentCount: number }; clients: { id: string }[] }) {
  const activeDeals = transactions.filter((t) => t.stage !== "Closed");
  const teamGCI     = activeDeals.reduce((s, t) => s + t.price * 0.025 * (t.pctDone / 100), 0) * (agency?.agentCount ?? 5) * 0.6;
  const liveMLS     = mlsConnections.filter((m) => m.status === "Live").length;

  return (
    <>
      <p className="mt-6 text-2xl text-mute tight max-w-3xl leading-snug">
        {agency?.name ?? "The team"} · {agency?.agentCount ?? "—"} agents on board · {clients.length} clients across the book.
      </p>
      <div className="mt-14 grid md:grid-cols-3 gap-4">
        <BigStat label="Team forecast GCI" value={fmtCompact(teamGCI)} sub="weighted, this quarter" />
        <BigStat label="Active agents" value={String(agency?.agentCount ?? 5)} sub="seats in good standing" />
        <BigStatDark label="MLS feeds" value={`${liveMLS}`} suffix={`/ ${mlsConnections.length}`} sub="across the team's regions" />
      </div>
    </>
  );
}

function LandlordHero({ landlord }: { landlord?: { doors: number; propertyType: string } }) {
  const doors = landlord?.doors ?? 12;
  const occupancy = 0.86;
  const monthlyRevenue = doors * 2300 * occupancy;

  return (
    <>
      <p className="mt-6 text-2xl text-mute tight max-w-3xl leading-snug">
        {doors} doors · {Math.round(occupancy * 100)}% occupied · 1 lease ending this month.
      </p>
      <div className="mt-14 grid md:grid-cols-3 gap-4">
        <BigStat label="Monthly revenue" value={fmtCompact(monthlyRevenue)} sub="all units, gross" />
        <BigStat label="Occupied" value={`${Math.round(occupancy * doors)}`} suffix={`/ ${doors}`} sub={`${Math.round(occupancy * 100)}% occupancy`} />
        <BigStatDark label="Vacancies" value={`${doors - Math.round(occupancy * doors)}`} sub="ready or being turned" />
      </div>
    </>
  );
}

function BigStat({ label, value, suffix, sub }: { label: string; value: string; suffix?: string; sub: string }) {
  return (
    <div className="relative rounded-3xl bg-white border border-line p-8 overflow-hidden">
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-200/30 blur-3xl rounded-full" />
      <p className="relative text-sm text-mute">{label}</p>
      <p className="relative mt-3 text-5xl md:text-6xl font-semibold tighter text-ink">
        {value}{suffix && <span className="text-mute/60"> {suffix}</span>}
      </p>
      <p className="relative text-sm text-mute mt-2">{sub}</p>
      <span className="absolute top-0 left-8 right-8 h-0.5 bg-amber-400" />
    </div>
  );
}

function BigStatDark({ label, value, suffix, sub }: { label: string; value: string; suffix?: string; sub: string }) {
  return (
    <div className="rounded-3xl bg-ink text-white p-8 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-amber-500/35 blur-3xl rounded-full" />
      <div className="absolute -bottom-12 right-1/3 w-44 h-44 bg-amber-400/25 blur-3xl rounded-full" />
      <p className="relative text-sm text-amber-300">{label}</p>
      <p className="relative mt-3 text-5xl md:text-6xl font-semibold tighter">
        {value}{suffix && <span className="text-white/40"> {suffix}</span>}
      </p>
      <p className="relative text-sm text-white/60 mt-2">{sub}</p>
    </div>
  );
}
