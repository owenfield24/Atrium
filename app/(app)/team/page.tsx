"use client";

import { team } from "@/lib/saas/data";
import { fmt, fmtCompact } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const splits = [
  { name: "New",         profile: "0–5 tx/yr",        split: "70 / 30",  cap: "—",        post: "—" },
  { name: "Established", profile: "5–20 tx/yr",       split: "80 / 20",  cap: "$15,000",  post: "95 / 5" },
  { name: "Top Producer",profile: "20+ tx/yr",        split: "85 / 15",  cap: "$20,000",  post: "100% (tx fee only)" },
  { name: "Mentor",      profile: "Top + recruits",   split: "85 / 15",  cap: "$12,000",  post: "100% + 5% override" },
];

const recruits = [
  { name: "Dani Owens",     status: "Discovery scheduled", source: "DFW outreach list", note: "10 yrs at small boutique" },
  { name: "Jamie Holloway", status: "Discovery done",      source: "LinkedIn",          note: "Wants modern tooling, hates kvCORE" },
  { name: "Bryan Estrada",  status: "Offer sent",          source: "Referral",          note: "Top producer 28 tx/yr" },
  { name: "Lola Marquez",   status: "Onboarded",           source: "Atrium Academy",    note: "Cohort 3, 90-day grad" },
];

export default function TeamPage() {
  const ytdGCI = team.reduce((s, m) => s + m.ytdGCI, 0);
  const active = team.filter((m) => m.status === "Active").length;
  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Seats in use"     value={team.length} sub={`${active} active`} />
        <StatCard label="YTD GCI"          value={fmtCompact(ytdGCI)} sub="all agents"  highlight />
        <StatCard label="Top producer"     value="Jordan R."  sub="$184k YTD" />
        <StatCard label="Recruiting pipeline" value={recruits.length} sub="incl. Atrium Academy grads" />
      </div>

      <Tabs
        tabs={[
          { id: "agents",   label: "Agents",   count: team.length },
          { id: "splits",   label: "Splits & caps" },
          { id: "recruit",  label: "Recruiting", count: recruits.length },
          { id: "academy",  label: "Atrium Academy" },
          { id: "perm",     label: "Permissions" },
        ]}
      >
        {(active) => {
          if (active === "agents")  return <Agents />;
          if (active === "splits")  return <Splits />;
          if (active === "recruit") return <Recruiting />;
          if (active === "academy") return <Academy />;
          if (active === "perm")    return <Permissions />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Agents() {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Agent</th>
            <th className="text-left px-5 py-3 font-semibold">Role</th>
            <th className="text-left px-5 py-3 font-semibold">Seat</th>
            <th className="text-right px-5 py-3 font-semibold">YTD GCI</th>
            <th className="text-right px-5 py-3 font-semibold">YTD tx</th>
            <th className="text-left px-5 py-3 font-semibold">Cap progress</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {team.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">{m.initials}</div>
                  <p className="font-medium text-slate-900">{m.name}</p>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-700">{m.role}</td>
              <td className="px-5 py-3"><Badge tone={m.seat === "Atrium" ? "amber" : m.seat === "Foundation" ? "violet" : m.seat === "Courtyard" ? "blue" : "slate"}>{m.seat}</Badge></td>
              <td className="px-5 py-3 text-right font-mono text-slate-900">{fmt(m.ytdGCI)}</td>
              <td className="px-5 py-3 text-right text-slate-700">{m.ytdTransactions}</td>
              <td className="px-5 py-3 w-40">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${m.capProgress * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono w-9 text-right">{Math.round(m.capProgress * 100)}%</span>
                </div>
              </td>
              <td className="px-5 py-3"><Badge tone={m.status === "Active" ? "emerald" : m.status === "Onboarding" ? "amber" : "slate"}>{m.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Splits() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card padding="p-0">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Commission tiers</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
              <th className="text-left px-5 py-3 font-semibold">Tier</th>
              <th className="text-left px-5 py-3 font-semibold">Profile</th>
              <th className="text-left px-5 py-3 font-semibold">Split</th>
              <th className="text-left px-5 py-3 font-semibold">Cap</th>
              <th className="text-left px-5 py-3 font-semibold">Post-cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {splits.map((s) => (
              <tr key={s.name}>
                <td className="px-5 py-3 font-semibold text-slate-900">{s.name}</td>
                <td className="px-5 py-3 text-slate-700 text-xs">{s.profile}</td>
                <td className="px-5 py-3 font-mono text-slate-700">{s.split}</td>
                <td className="px-5 py-3 font-mono text-slate-700">{s.cap}</td>
                <td className="px-5 py-3 text-slate-600 text-xs">{s.post}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Alternative model</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Flat-fee + cap, eXp-style — <span className="font-mono">$85/mo + $250/tx + $16k cap → 100%</span>.
          Easier to recruit on, harder to forecast.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">A/B test</p>
          <p className="text-sm text-slate-800 mt-1">Run flat-fee on new recruits in Q4 2026. Compare retention + GCI year-over.</p>
        </div>
      </Card>
    </div>
  );
}

function Recruiting() {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Recruit</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="text-left px-5 py-3 font-semibold">Source</th>
            <th className="text-left px-5 py-3 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recruits.map((r) => (
            <tr key={r.name}>
              <td className="px-5 py-3 font-medium text-slate-900">{r.name}</td>
              <td className="px-5 py-3"><Badge tone={r.status === "Onboarded" ? "emerald" : r.status === "Offer sent" ? "amber" : "slate"}>{r.status}</Badge></td>
              <td className="px-5 py-3 text-slate-600 text-xs">{r.source}</td>
              <td className="px-5 py-3 text-slate-700 text-xs">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Academy() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Atrium Academy</h3>
        <p className="text-xs text-slate-500 mb-3">90-day cohort for new licensees. Recruiting pipeline + revenue.</p>
        <div className="space-y-2 text-sm">
          {[
            { c: "Cohort 3 (current)", state: "Week 7 of 12", count: "8 students" },
            { c: "Cohort 4 (open)",    state: "Starts May 11", count: "5 enrolled / 12 cap" },
            { c: "Cohort 2 (closed)",  state: "Graduated",     count: "9 grads, 6 onboarded" },
          ].map((c) => (
            <div key={c.c} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{c.c}</p>
                <p className="text-xs text-slate-500">{c.state}</p>
              </div>
              <span className="text-xs text-slate-700">{c.count}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Curriculum</h3>
        <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
          <li>Texas RE basics + TREC compliance</li>
          <li>Buyer-broker post-settlement</li>
          <li>CMA mastery using Atrium Reports</li>
          <li>Lead capture + sphere management</li>
          <li>Listing presentations + Atrium Originals</li>
          <li>Negotiation + offer drafting</li>
          <li>Closing, audit, and the Atrium way</li>
        </ol>
      </Card>
    </div>
  );
}

function Permissions() {
  const matrix = [
    { feature: "View deals",          owner: true, agent: true, tc: true, marketing: false, admin: true },
    { feature: "Edit splits",         owner: true, agent: false, tc: false, marketing: false, admin: false },
    { feature: "Approve marketing",   owner: true, agent: false, tc: false, marketing: true, admin: false },
    { feature: "Manage seats",        owner: true, agent: false, tc: false, marketing: false, admin: true },
    { feature: "Export audit log",    owner: true, agent: false, tc: false, marketing: false, admin: true },
    { feature: "Compliance vault",    owner: true, agent: false, tc: true, marketing: false, admin: true },
  ];
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Action</th>
            {["Owner / DB", "Agent", "TC", "Marketing", "Admin"].map((r) => (
              <th key={r} className="text-center px-5 py-3 font-semibold">{r}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {matrix.map((m) => (
            <tr key={m.feature}>
              <td className="px-5 py-3 text-slate-800">{m.feature}</td>
              {[m.owner, m.agent, m.tc, m.marketing, m.admin].map((v, i) => (
                <td key={i} className="px-5 py-3 text-center">
                  {v ? <span className="text-emerald-600 font-bold">●</span> : <span className="text-slate-300">○</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
