"use client";

import Link from "next/link";
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

  const firstName = profile?.firstName || "Tyrone";

  return (
    <div className="max-w-6xl mx-auto pt-16 pb-24">
      {/* OPENING */}
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {today}
      </div>
      <h1 className="mt-5 text-6xl md:text-7xl font-semibold tighter leading-[0.95]">
        Good morning,<br />{firstName}.
      </h1>

      {role === "agent-solo"   && <SoloAgentHero    clients={clients} />}
      {role === "agent-agency" && <AgencyHero       agency={profile?.agency} clients={clients} />}
      {role === "landlord"     && <LandlordHero     landlord={profile?.landlord} />}

      {/* DAILY QUOTE — replaces "Jump to" */}
      <section className="mt-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Today's quote</p>
        <figure className="mt-4 relative rounded-3xl bg-white border border-line p-8 md:p-10 overflow-hidden">
          <span className="absolute top-0 left-8 right-8 h-0.5 bg-amber-400" />
          <span className="absolute -top-6 left-6 text-[8rem] leading-none font-serif text-amber-200/80 select-none pointer-events-none">"</span>
          <blockquote className="relative text-2xl md:text-3xl font-semibold tighter leading-snug text-ink max-w-3xl">
            {quote.quote}
          </blockquote>
          <figcaption className="relative mt-5 text-sm text-mute font-medium">— {quote.author}</figcaption>
        </figure>
      </section>

      {/* ROLE-AWARE QUICK ACTIONS */}
      <section className="mt-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Quick actions</p>
        <h2 className="mt-2 text-4xl font-semibold tighter">
          {role === "landlord" ? "Manage your portfolio." : "Where do you want to go next?"}
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(role === "agent-solo"   ? SOLO_ACTIONS    :
            role === "agent-agency" ? AGENCY_ACTIONS  :
            LANDLORD_ACTIONS).map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative rounded-2xl bg-white border border-line p-5 hover:shadow-lg hover:shadow-amber-200/40 hover:border-amber-400/60 transition"
            >
              <span className="absolute left-5 top-0 h-0.5 w-10 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{s.tag}</p>
              <p className="mt-2 text-base font-semibold text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-mute leading-relaxed">{s.desc}</p>
              <p className="mt-3 text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                Open <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </p>
            </Link>
          ))}
        </div>
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

// ── Role action sets ────────────────────────────────────────────────────
const SOLO_ACTIONS = [
  { tag: "Clients",  title: "Add a client",       desc: "Drop in a new buyer, seller, or lead.", href: "/clients"     },
  { tag: "Brief",    title: "Today's market",     desc: "National + your region in 30 seconds.",  href: "/brief"       },
  { tag: "Deals",    title: "Pipeline",            desc: "Buyer + seller stages on one board.",   href: "/transactions" },
  { tag: "Marketing",title: "Send the Brief",      desc: "Push the daily Brief to your sphere.",  href: "/marketing"   },
];

const AGENCY_ACTIONS = [
  { tag: "Team",     title: "Splits and caps",    desc: "Who's on track, who needs a nudge.",     href: "/team"        },
  { tag: "Brief",    title: "Today's market",     desc: "National + each agent's region.",         href: "/brief"       },
  { tag: "Clients",  title: "Add a client",        desc: "Assigned to an agent on your team.",     href: "/clients"     },
  { tag: "Compliance",title: "Audit log",          desc: "File completeness across all deals.",    href: "/compliance"  },
];

const LANDLORD_ACTIONS = [
  { tag: "Properties", title: "Add a property",    desc: "Building → unit → tenant in 30 seconds.", href: "/keystone"    },
  { tag: "Brief",      title: "Rental market",     desc: "Rent comps and supply for your region.",  href: "/brief"       },
  { tag: "Tenants",    title: "Lease tracking",    desc: "Renewals, deposits, insurance.",          href: "/keystone"    },
  { tag: "Maintenance",title: "Open tickets",      desc: "Vendors and repairs in one queue.",       href: "/keystone"    },
];
