"use client";

import { auditEvents } from "@/lib/saas/data";
import { timeAgo } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CompliancePage() {
  const last24h = auditEvents.length;
  const suppressed = 14 + 1;

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Audit events"     value={last24h} sub="last 24h" />
        <StatCard label="Listings suppressed" value={suppressed} sub="Internet-Display=No + exempts" />
        <StatCard label="MFA on admin"     value="100%" sub="enforced" highlight />
        <StatCard label="Vault docs"       value="247" sub="across 36 deals" />
      </div>

      <Tabs
        tabs={[
          { id: "rules",  label: "IDX rules" },
          { id: "audit",  label: "Audit log",  count: auditEvents.length },
          { id: "vault",  label: "Document vault" },
          { id: "fairh",  label: "Fair Housing checks" },
          { id: "trec",   label: "TREC audit-prep" },
        ]}
      >
        {(active) => {
          if (active === "rules")  return <Rules />;
          if (active === "audit")  return <AuditLog />;
          if (active === "vault")  return <Vault />;
          if (active === "fairh")  return <FairHousing />;
          if (active === "trec")   return <TRECAuditPrep />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Rules() {
  const rules = [
    "Listing brokerage attribution on every card + detail page",
    "Listing agent name + firm phone or email visible",
    "Public remarks only — agent remarks suppressed",
    "Statuses A / AO / AK / AC only on consumer surfaces",
    "MLS attribution + copyright notice loaded per-MLS",
    "Standard disclaimer per MLS template",
    "Internet-Display = Yes honored",
    "Office-Exclusive Exempt + Delayed Marketing Exempt suppressed",
    "Buyer-broker compensation never displayed",
    "Audit trail of every consumer view + search + share",
    "No password sharing — per-user authentication enforced",
  ];
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Active enforcement</h3>
      <p className="text-xs text-slate-500 mb-4">NAR Policy 7.58 + per-MLS supplemental rules.</p>
      <div className="grid md:grid-cols-2 gap-2">
        {rules.map((r) => (
          <div key={r} className="flex items-center gap-2 text-sm">
            <span className="text-emerald-500">✓</span>
            <span className="text-slate-700">{r}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditLog() {
  const tone = (k: string): "blue" | "violet" | "amber" | "slate" | "emerald" => {
    if (k === "view") return "blue";
    if (k === "share") return "violet";
    if (k === "search") return "amber";
    if (k === "rule") return "slate";
    return "emerald";
  };
  return (
    <Card padding="p-0">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Audit log</h3>
        <button className="text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-md">
          Export CSV
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">When</th>
            <th className="text-left px-5 py-3 font-semibold">Actor</th>
            <th className="text-left px-5 py-3 font-semibold">Type</th>
            <th className="text-left px-5 py-3 font-semibold">Event</th>
            <th className="text-left px-5 py-3 font-semibold">MLS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {auditEvents.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-xs text-slate-500">{timeAgo(e.ts)}</td>
              <td className="px-5 py-3 text-xs font-mono text-slate-700">{e.actor}</td>
              <td className="px-5 py-3"><Badge tone={tone(e.kind)}>{e.kind}</Badge></td>
              <td className="px-5 py-3 text-slate-800">{e.message}</td>
              <td className="px-5 py-3 text-xs text-slate-500">{e.mls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Vault() {
  const folders = [
    { name: "Active deals",   docs: 132, size: "486 MB" },
    { name: "Closed 2026",    docs:  64, size: "244 MB" },
    { name: "Listing agreements", docs: 28, size: "58 MB" },
    { name: "Buyer-broker agreements", docs: 41, size: "92 MB" },
    { name: "Lease agreements (Keystone)", docs: 22, size: "78 MB" },
    { name: "Disclosures + addenda", docs: 77, size: "212 MB" },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {folders.map((f) => (
        <Card key={f.name}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Folder</p>
          <p className="text-base font-semibold text-slate-900 mt-1">{f.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div><p className="text-lg font-bold text-slate-900">{f.docs}</p><p className="text-xs text-slate-500">docs</p></div>
            <div><p className="text-lg font-bold text-slate-900">{f.size}</p><p className="text-xs text-slate-500">size</p></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FairHousing() {
  const checks = [
    { what: "AI listing copy filter",   state: "Passing", note: "Last 64 generations ran through filter; 0 blocked" },
    { what: "Tenant screening fields",   state: "Clean",   note: "No protected-class fields exposed in screening UI" },
    { what: "Advertising audience checks", state: "Active", note: "FB / Google audience targeting limited per HUD guidance" },
    { what: "Standardized rejection reasons", state: "Active", note: "From a fixed list. Custom reasons gated by attorney review." },
  ];
  const tone = (s: string): "emerald" | "blue" =>
    s === "Passing" ? "emerald" : "blue";
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {checks.map((c) => (
        <Card key={c.what}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">{c.what}</h3>
            <Badge tone={tone(c.state)}>{c.state}</Badge>
          </div>
          <p className="text-sm text-slate-600">{c.note}</p>
        </Card>
      ))}
    </div>
  );
}

function TRECAuditPrep() {
  const items = [
    { label: "Buyer-broker representation agreements on file", coverage: "97%", trend: "▲ 3%" },
    { label: "Listing agreements on file",                     coverage: "100%", trend: "—" },
    { label: "Seller's disclosures (T-47) on file",            coverage: "94%", trend: "▲ 2%" },
    { label: "Wire-fraud disclosure delivered",                 coverage: "100%", trend: "—" },
    { label: "IABS form delivered to clients",                  coverage: "98%", trend: "▼ 1%" },
  ];
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">TREC audit-prep coverage</h3>
      <p className="text-xs text-slate-500 mb-4">Auto-organizes deal files into the categories TREC inspects.</p>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700">{i.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{i.coverage}</span>
                <span className="text-xs text-emerald-600">{i.trend}</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: i.coverage }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
