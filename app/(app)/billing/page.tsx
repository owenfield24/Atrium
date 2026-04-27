"use client";

import { team, pricingTiers } from "@/lib/saas/data";
import { fmt, fmtCompact } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const invoices = [
  { id: "INV-2026-04", date: "2026-04-01", desc: "Atrium tier · 6 seats · April",  amount: 673,  status: "Paid" },
  { id: "INV-2026-03", date: "2026-03-01", desc: "Atrium tier · 5 seats · March",  amount: 644,  status: "Paid" },
  { id: "INV-2026-02", date: "2026-02-01", desc: "Atrium tier · 5 seats · Feb",    amount: 644,  status: "Paid" },
  { id: "INV-2026-01", date: "2026-01-01", desc: "Courtyard → Atrium upgrade",     amount: 449,  status: "Paid" },
  { id: "INV-2025-12", date: "2025-12-01", desc: "Courtyard tier · 4 seats · Dec", amount: 179,  status: "Paid" },
];

const nexusStates = [
  { state: "Texas",        revenue: 184500, taxable: true,  registered: true,  rate: "8.25%" },
  { state: "Florida",      revenue:  68200, taxable: false, registered: false, rate: "—" },
  { state: "California",   revenue:  92400, taxable: false, registered: false, rate: "—" },
  { state: "Pennsylvania", revenue: 122000, taxable: true,  registered: true,  rate: "6.0%" },
  { state: "Washington",   revenue: 110800, taxable: true,  registered: false, rate: "Pending" },
  { state: "Arizona",      revenue:  41000, taxable: true,  registered: false, rate: "—" },
];

export default function BillingPage() {
  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Plan"           value="Atrium" sub="$499/mo + $29/seat" highlight />
        <StatCard label="Seats"          value={team.length} sub={`6 of 25 (Atrium cap)`} />
        <StatCard label="Monthly run-rate" value={fmt(499 + team.length * 29)} sub="next bill May 1" />
        <StatCard label="YTD spend"      value={fmtCompact(invoices.reduce((s, i) => s + i.amount, 0))} sub={`${invoices.length} invoices`} />
      </div>

      <Tabs
        tabs={[
          { id: "plan",    label: "Plan & seats" },
          { id: "invoices",label: "Invoices",  count: invoices.length },
          { id: "nexus",   label: "Sales-tax nexus" },
          { id: "method",  label: "Payment method" },
          { id: "upgrade", label: "Compare plans" },
        ]}
      >
        {(active) => {
          if (active === "plan")     return <PlanPane />;
          if (active === "invoices") return <Invoices />;
          if (active === "nexus")    return <Nexus />;
          if (active === "method")   return <PaymentMethod />;
          if (active === "upgrade")  return <Compare />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function PlanPane() {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <Card className="md:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Current subscription</h3>
          <Badge tone="amber">Atrium tier</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><p className="text-xs text-slate-500">Base</p><p className="font-mono font-bold text-slate-900">$499 / mo</p></div>
          <div><p className="text-xs text-slate-500">Per seat</p><p className="font-mono font-bold text-slate-900">$29 / mo</p></div>
          <div><p className="text-xs text-slate-500">Renews</p><p className="font-mono font-bold text-slate-900">May 1, 2026</p></div>
        </div>
        <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Seats</h4>
        <div className="divide-y divide-slate-100">
          {team.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">{m.initials}</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600">$29 / mo</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Add-ons</h3>
        <div className="space-y-3">
          {[
            { name: "Keystone — PM tier", price: "$129/mo + $3/unit", on: true },
            { name: "Atrium Insights — Pro", price: "$299/mo", on: true },
            { name: "Atrium Originals (5/mo)", price: "$1,495/mo", on: false },
            { name: "Transaction Coordination", price: "$1,800/mo unlimited", on: false },
          ].map((a) => (
            <div key={a.name} className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{a.name}</p>
                <p className="text-xs text-slate-500 font-mono">{a.price}</p>
              </div>
              <Badge tone={a.on ? "emerald" : "slate"}>{a.on ? "On" : "Off"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Invoices() {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Invoice</th>
            <th className="text-left px-5 py-3 font-semibold">Date</th>
            <th className="text-left px-5 py-3 font-semibold">Description</th>
            <th className="text-right px-5 py-3 font-semibold">Amount</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((i) => (
            <tr key={i.id}>
              <td className="px-5 py-3 font-mono text-xs text-slate-700">{i.id}</td>
              <td className="px-5 py-3 text-slate-600 text-xs">{new Date(i.date).toLocaleDateString()}</td>
              <td className="px-5 py-3 text-slate-800">{i.desc}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-900">{fmt(i.amount)}</td>
              <td className="px-5 py-3"><Badge tone="emerald">{i.status}</Badge></td>
              <td className="px-5 py-3 text-right">
                <button className="text-xs font-medium text-slate-500 hover:text-slate-900">PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Nexus() {
  return (
    <Card padding="p-0">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">SaaS sales-tax nexus monitoring</h3>
          <p className="text-xs text-slate-500">Powered by Anrok. Triggers once revenue or transaction count crosses threshold.</p>
        </div>
        <Badge tone="emerald">Connected</Badge>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">State</th>
            <th className="text-right px-5 py-3 font-semibold">Revenue</th>
            <th className="text-left px-5 py-3 font-semibold">SaaS taxable?</th>
            <th className="text-left px-5 py-3 font-semibold">Registered</th>
            <th className="text-right px-5 py-3 font-semibold">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {nexusStates.map((n) => (
            <tr key={n.state}>
              <td className="px-5 py-3 font-medium text-slate-900">{n.state}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-700">{fmt(n.revenue)}</td>
              <td className="px-5 py-3"><Badge tone={n.taxable ? "amber" : "slate"}>{n.taxable ? "Taxable" : "Exempt"}</Badge></td>
              <td className="px-5 py-3"><Badge tone={n.registered ? "emerald" : (n.taxable ? "red" : "slate")}>{n.registered ? "Registered" : (n.taxable ? "Action needed" : "—")}</Badge></td>
              <td className="px-5 py-3 text-right text-slate-700 font-mono text-xs">{n.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function PaymentMethod() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment method</h3>
      <div className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Visa ending in 4242</p>
          <p className="text-xs text-slate-500">Expires 09/2028 · billed via Stripe</p>
        </div>
        <Badge tone="emerald">Default</Badge>
      </div>
      <button className="mt-3 text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-md">
        Add payment method
      </button>
    </Card>
  );
}

function Compare() {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
      {pricingTiers.map((t) => (
        <Card key={t.id} className={t.id === "atrium" ? "border-amber-400 ring-1 ring-amber-300" : ""}>
          {t.id === "atrium" && <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Current plan</p>}
          <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
          <p className="text-xs text-slate-500">{t.blurb}</p>
          <p className="mt-3"><span className="text-xl font-bold text-slate-900">${t.price}</span><span className="text-xs text-slate-500">{t.unit}</span></p>
          <ul className="mt-3 space-y-1">
            {t.features.slice(0, 3).map((f) => (
              <li key={f} className="text-xs text-slate-600 flex gap-1.5"><span className="text-emerald-500">✓</span>{f}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
