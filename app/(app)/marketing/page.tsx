"use client";

import { mlsListings } from "@/lib/mls/data";
import { fmt } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function MarketingPage() {
  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Atrium Brief subs"   value="3,142" sub="+412 this month" />
        <StatCard label="Scheduled posts"     value="18"    sub="next 14 days" />
        <StatCard label="AI copy generated"   value="64"    sub="this month" highlight />
        <StatCard label="Listings boosted"    value="9"     sub="open houses live" />
      </div>

      <Tabs
        tabs={[
          { id: "campaigns",  label: "Campaigns" },
          { id: "ai-copy",    label: "AI listing copy" },
          { id: "social",     label: "Social scheduler" },
          { id: "media",      label: "Listing media" },
          { id: "newsletter", label: "Atrium Brief" },
          { id: "openhouse",  label: "Open-house mode" },
        ]}
      >
        {(active) => {
          if (active === "campaigns")  return <Campaigns />;
          if (active === "ai-copy")    return <AICopy />;
          if (active === "social")     return <SocialScheduler />;
          if (active === "media")      return <Media />;
          if (active === "newsletter") return <Newsletter />;
          if (active === "openhouse")  return <OpenHouseMode />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Campaigns() {
  const campaigns = [
    { name: "April market update",       channel: "Email + IG",   audience: "Sphere · 1,204",  status: "Live",       perf: "32% open · 6.4% CTR" },
    { name: "Just-Listed: 4821 Westbrook", channel: "Email + Postcard", audience: "Geographic farm · 800",     status: "Scheduled",  perf: "—" },
    { name: "First-time buyer guide",     channel: "Newsletter",   audience: "Subscribers · 3,142",          status: "Live",       perf: "44% open" },
    { name: "Q1 closing-day social pack", channel: "Instagram + TikTok", audience: "Public · 8,400 followers", status: "Draft",      perf: "—" },
  ];
  const tone = (s: string): "emerald" | "amber" | "slate" =>
    s === "Live" ? "emerald" : s === "Scheduled" ? "amber" : "slate";
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Campaign</th>
            <th className="text-left px-5 py-3 font-semibold">Channel</th>
            <th className="text-left px-5 py-3 font-semibold">Audience</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="text-right px-5 py-3 font-semibold">Performance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.map((c) => (
            <tr key={c.name} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
              <td className="px-5 py-3 text-slate-600">{c.channel}</td>
              <td className="px-5 py-3 text-slate-600 text-xs">{c.audience}</td>
              <td className="px-5 py-3"><Badge tone={tone(c.status)}>{c.status}</Badge></td>
              <td className="px-5 py-3 text-right text-slate-700 text-xs font-mono">{c.perf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function AICopy() {
  const sample = mlsListings[0];
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Generate listing copy</h3>
          <Badge tone="violet">Claude Sonnet 4.6</Badge>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-600">Listing</label>
            <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={sample.mlsId}>
              {mlsListings.slice(0, 6).map((l) => <option key={l.mlsId} value={l.mlsId}>{l.address}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Tone</label>
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option>Modern luxury</option>
                <option>Family-warm</option>
                <option>Investor-direct</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Length</label>
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option>MLS (250 chars)</option>
                <option>Web (500 chars)</option>
                <option>Print (150 chars)</option>
              </select>
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            ⚠ All AI copy passes through a Fair Housing filter before being shown to the agent. Never auto-published.
          </div>
          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-md">
            Generate · uses 1 credit
          </button>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Preview</h3>
        <p className="text-xs text-slate-500 mb-3">{sample.address}</p>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
          Stunning modern home in West Austin. Open-concept living anchored by a chef's kitchen with quartz
          counters and premium appliances. Primary suite features a spa bath and walk-in closet, while the
          backyard delivers pool, outdoor kitchen, and quiet evening sun. Solar + smart-home throughout.
          Convenient to West Austin schools, downtown, and the lake.
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Badge tone="emerald">Fair Housing: clean</Badge>
          <Badge tone="slate">256 chars</Badge>
        </div>
      </Card>
    </div>
  );
}

function SocialScheduler() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const events: Record<string, { time: string; what: string; channel: "IG" | "TikTok" | "FB" | "X" }[]> = {
    Mon: [{ time: "9:00 AM",  what: "Just-Listed reel: 4821 Westbrook", channel: "IG" }],
    Tue: [{ time: "11:00 AM", what: "Sold-day photo: 316 Pemberton",   channel: "FB" }],
    Wed: [{ time: "8:30 AM",  what: "Atrium Brief teaser",             channel: "X"  }, { time: "5:00 PM", what: "Westlake walkthrough", channel: "TikTok" }],
    Thu: [{ time: "10:00 AM", what: "Open house Sat reminder",         channel: "IG" }],
    Fri: [],
    Sat: [{ time: "11:00 AM", what: "Open house live: 4821 Westbrook", channel: "IG" }],
    Sun: [{ time: "5:00 PM",  what: "Weekly market snapshot",          channel: "IG" }],
  };
  const tone = (c: string): "violet" | "amber" | "blue" | "slate" =>
    c === "IG" ? "violet" : c === "TikTok" ? "amber" : c === "FB" ? "blue" : "slate";
  return (
    <Card padding="p-3">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d} className="rounded-lg bg-slate-50 border border-slate-200 p-3 min-h-[180px]">
            <p className="text-xs font-bold uppercase text-slate-500 mb-2">{d}</p>
            <div className="space-y-2">
              {events[d].map((e, i) => (
                <div key={i} className="bg-white rounded-md border border-slate-200 px-2 py-2 text-xs">
                  <Badge tone={tone(e.channel)}>{e.channel}</Badge>
                  <p className="text-slate-700 mt-1 leading-tight">{e.what}</p>
                  <p className="text-slate-400 mt-0.5">{e.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Media() {
  const orders = [
    { addr: "4821 Westbrook Lane",   pkg: "Luxury",   status: "Delivered",   shoot: "2026-04-19" },
    { addr: "1103 Ridgecrest Drive", pkg: "Standard", status: "In edit",     shoot: "2026-04-22" },
    { addr: "316 Pemberton Heights", pkg: "Luxury",   status: "Scheduled",   shoot: "2026-04-29" },
    { addr: "8765 Lakeview Terrace", pkg: "Standard", status: "Pending shoot", shoot: "—" },
  ];
  const tone = (s: string): "emerald" | "amber" | "slate" =>
    s === "Delivered" ? "emerald" : s === "In edit" || s === "Scheduled" ? "amber" : "slate";
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Atrium Originals — order queue</h3>
        <div className="divide-y divide-slate-100">
          {orders.map((o) => (
            <div key={o.addr} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{o.addr}</p>
                <p className="text-xs text-slate-500">{o.pkg} · shoot {o.shoot}</p>
              </div>
              <Badge tone={tone(o.status)}>{o.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Packages</h3>
        <div className="space-y-3">
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Standard</p>
              <span className="font-mono text-sm">$399</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">25 stills · drone · 30s walkthrough</p>
          </div>
          <div className="border border-amber-300 rounded-lg p-4 bg-amber-50/40">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Luxury</p>
              <span className="font-mono text-sm">$899</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">40 stills · drone · cinematic 90s · twilight + lifestyle</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Newsletter() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">The Atrium Brief — issue queue</h3>
        <div className="space-y-3">
          {[
            { title: "Issue #18: Q1 DFW pricing reset", date: "Apr 28", state: "Drafting" },
            { title: "Issue #17: Westover Hills walkthrough", date: "Apr 21", state: "Sent · 41% open" },
            { title: "Issue #16: New build vs resale 2026", date: "Apr 14", state: "Sent · 38% open" },
          ].map((i) => (
            <div key={i.title} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{i.title}</p>
                <p className="text-xs text-slate-500">{i.date}</p>
              </div>
              <Badge tone={i.state.startsWith("Drafting") ? "amber" : "emerald"}>{i.state}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Subscribers</h3>
        <p className="text-3xl font-bold text-slate-900">3,142</p>
        <p className="text-xs text-emerald-600 mt-0.5">▲ +412 this month</p>
        <div className="mt-4 text-xs text-slate-500 space-y-1">
          <p>Goal · 10,000 in 18 months</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: "31%" }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function OpenHouseMode() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Open-house mode</h3>
      <p className="text-sm text-slate-600 mb-4">Hand the iPad to guests at the door. Captures contact, buyer-broker status, and pre-approval — automatically syncs into the deal.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active session</p>
          <p className="text-base font-semibold text-slate-900 mt-1">4821 Westbrook Lane</p>
          <p className="text-xs text-slate-500 mt-0.5">Sat, Apr 27 · 11:00 AM – 2:00 PM</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-bold text-slate-900">14</p><p className="text-xs text-slate-500">visitors</p></div>
            <div><p className="text-xl font-bold text-slate-900">9</p><p className="text-xs text-slate-500">contacts captured</p></div>
            <div><p className="text-xl font-bold text-emerald-600">3</p><p className="text-xs text-slate-500">pre-approved</p></div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Settings</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex justify-between">Require buyer-broker check <span className="text-emerald-600 font-semibold">On</span></li>
            <li className="flex justify-between">Pre-approval prompt <span className="text-emerald-600 font-semibold">On</span></li>
            <li className="flex justify-between">SMS thank-you (24h) <span className="text-emerald-600 font-semibold">On</span></li>
            <li className="flex justify-between">Auto-add to sphere <span className="text-emerald-600 font-semibold">On</span></li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
