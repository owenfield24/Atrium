"use client";

import { mlsConnections } from "@/lib/saas/data";
import { fmtNum, timeAgo } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const otherIntegrations = [
  { name: "Stripe",          area: "Payments + subscription billing",  status: "Connected" },
  { name: "Plaid",            area: "Bank verification (Keystone)",     status: "Connected" },
  { name: "Resend",           area: "Transactional + marketing email",  status: "Connected" },
  { name: "Twilio",           area: "SMS + voice",                       status: "Connected" },
  { name: "DocuSign",         area: "E-signature",                       status: "Connected" },
  { name: "Dotloop",          area: "Transaction documents",             status: "Connected" },
  { name: "TransUnion SmartMove", area: "Tenant screening (Keystone)",   status: "Connected" },
  { name: "Sure / Lemonade",  area: "Renters' insurance verification",   status: "Available" },
  { name: "Anrok",            area: "SaaS sales-tax compliance",         status: "Connected" },
  { name: "PostHog",          area: "Product analytics",                 status: "Connected" },
];

export default function IntegrationsPage() {
  const live = mlsConnections.filter((m) => m.status === "Live").length;
  const pending = mlsConnections.filter((m) => m.status !== "Live").length;
  const subs = mlsConnections.reduce((s, m) => s + m.subscribers, 0);

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="MLS feeds live"     value={live}  sub={`${pending} in progress`} />
        <StatCard label="Brokers connected"  value={mlsConnections.reduce((s, m) => s + m.brokers, 0)} sub="across MLSs" />
        <StatCard label="Subscribers reachable" value={fmtNum(subs)} sub="combined MLS coverage" highlight />
        <StatCard label="Vendor tooling"     value={otherIntegrations.length} sub={`${otherIntegrations.filter(i => i.status === "Connected").length} connected`} />
      </div>

      <Tabs
        tabs={[
          { id: "mls",     label: "MLS feeds", count: mlsConnections.length },
          { id: "vendors", label: "Vendor tooling", count: otherIntegrations.length },
          { id: "bridge",  label: "Bridge / Trestle setup" },
          { id: "field",   label: "Field mapping" },
        ]}
      >
        {(active) => {
          if (active === "mls")     return <MLSTable />;
          if (active === "vendors") return <Vendors />;
          if (active === "bridge")  return <Bridge />;
          if (active === "field")   return <FieldMapping />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function MLSTable() {
  const tone = (s: string): "emerald" | "amber" | "red" | "blue" => {
    if (s === "Live") return "emerald";
    if (s === "Pending" || s === "Provisioning") return "amber";
    if (s === "Action Needed") return "red";
    return "blue";
  };
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">MLS</th>
            <th className="text-left px-5 py-3 font-semibold">Region</th>
            <th className="text-right px-5 py-3 font-semibold">Subscribers</th>
            <th className="text-left px-5 py-3 font-semibold">Vendor</th>
            <th className="text-right px-5 py-3 font-semibold">Brokers</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="text-right px-5 py-3 font-semibold">Last sync</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {mlsConnections.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-semibold text-slate-900">{m.name}</td>
              <td className="px-5 py-3 text-slate-600 text-xs">{m.region}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-700">{fmtNum(m.subscribers)}</td>
              <td className="px-5 py-3"><Badge tone={m.vendor === "Direct" ? "violet" : "blue"}>{m.vendor}</Badge></td>
              <td className="px-5 py-3 text-right text-slate-700">{m.brokers}</td>
              <td className="px-5 py-3"><Badge tone={tone(m.status)}>{m.status}</Badge></td>
              <td className="px-5 py-3 text-right text-xs text-slate-500">{m.lastSync === "—" ? "—" : timeAgo(m.lastSync)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Vendors() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {otherIntegrations.map((v) => (
        <Card key={v.name}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{v.name}</p>
              <p className="text-xs text-slate-500 mt-1">{v.area}</p>
            </div>
            <Badge tone={v.status === "Connected" ? "emerald" : "slate"}>{v.status}</Badge>
          </div>
          <button className="mt-4 text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-md">
            {v.status === "Connected" ? "Manage" : "Connect"}
          </button>
        </Card>
      ))}
    </div>
  );
}

function Bridge() {
  const steps = [
    { state: "done",     label: "Bridge Interactive developer account created" },
    { state: "done",     label: "Atrium product profile submitted (description, screenshots, data-use)" },
    { state: "done",     label: "First broker customer authorized vendor access" },
    { state: "done",     label: "RESO Web API credentials issued (NTREIS)" },
    { state: "active",   label: "Field-mapping review for ABOR (Austin)" },
    { state: "pending",  label: "Trestle backup account (CoreLogic)" },
    { state: "pending",  label: "Direct MLS license for CRMLS (when scale justifies)" },
  ];
  const tone = (s: string): "emerald" | "amber" | "slate" =>
    s === "done" ? "emerald" : s === "active" ? "amber" : "slate";
  const label = (s: string) => (s === "done" ? "✓ Done" : s === "active" ? "In progress" : "Pending");
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Vendor onboarding status</h3>
      <p className="text-xs text-slate-500 mb-4">From the Atrium SaaS Operations Guide — vendor checklist.</p>
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
            <Badge tone={tone(s.state)}>{label(s.state)}</Badge>
            <span className="text-sm text-slate-700">{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FieldMapping() {
  const fields = [
    { ours: "ListingId",          reso: "ListingKey",         note: "Primary key" },
    { ours: "address",            reso: "UnparsedAddress",    note: "Falls back to StreetNumber + StreetName" },
    { ours: "listPrice",          reso: "ListPrice",          note: "Numeric · USD" },
    { ours: "status",             reso: "StandardStatus",     note: "A / AO / AK / AC only on consumer surfaces" },
    { ours: "internetDisplay",    reso: "InternetEntireListingDisplayYN", note: "Suppression flag honored" },
    { ours: "listingAgent",       reso: "ListAgentFullName",  note: "Required attribution" },
    { ours: "brokerage",          reso: "ListOfficeName",     note: "Required attribution" },
    { ours: "publicRemarks",      reso: "PublicRemarks",      note: "Agent remarks NEVER displayed" },
    { ours: "compensation",       reso: "BuyerAgencyCompensation", note: "Hidden post-2024 settlement" },
  ];
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Atrium field</th>
            <th className="text-left px-5 py-3 font-semibold">RESO Data Dictionary</th>
            <th className="text-left px-5 py-3 font-semibold">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fields.map((f) => (
            <tr key={f.ours}>
              <td className="px-5 py-3 font-mono text-xs text-slate-900">{f.ours}</td>
              <td className="px-5 py-3 font-mono text-xs text-slate-700">{f.reso}</td>
              <td className="px-5 py-3 text-xs text-slate-600">{f.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
