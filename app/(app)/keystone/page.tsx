"use client";

import { buildings, units, tenants, maintenanceTickets, regionRules } from "@/lib/saas/data";
import { fmt, fmtCompact } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function KeystonePage() {
  const totalUnits   = units.length;
  const occupied     = units.filter((u) => u.status === "Occupied").length;
  const vacancy      = totalUnits ? (1 - occupied / totalUnits) * 100 : 0;
  const monthlyRent  = units.filter((u) => u.status === "Occupied").reduce((s, u) => s + u.rent, 0);
  const annualRent   = monthlyRent * 12;
  const portfolioValue = buildings.reduce((s, b) => s + b.marketValue, 0);

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Buildings"        value={buildings.length} sub="across 3 cities" />
        <StatCard label="Units"            value={totalUnits} sub={`${occupied} occupied`} />
        <StatCard label="Vacancy"          value={`${vacancy.toFixed(1)}%`} sub="trailing 30d" />
        <StatCard label="Monthly rent"     value={fmtCompact(monthlyRent)} sub={`${fmtCompact(annualRent)} ARR`} highlight />
        <StatCard label="Portfolio value"  value={fmtCompact(portfolioValue)} sub="market estimate" />
      </div>

      <Tabs
        tabs={[
          { id: "portfolio", label: "Portfolio" },
          { id: "rentroll",  label: "Rent roll", count: units.length },
          { id: "tenants",   label: "Tenants",   count: tenants.length },
          { id: "maint",     label: "Maintenance", count: maintenanceTickets.length },
          { id: "compliance",label: "Compliance" },
          { id: "vendors",   label: "Vendors" },
        ]}
      >
        {(active) => {
          if (active === "portfolio")  return <Portfolio />;
          if (active === "rentroll")   return <RentRoll />;
          if (active === "tenants")    return <Tenants />;
          if (active === "maint")      return <Maintenance />;
          if (active === "compliance") return <Compliance />;
          if (active === "vendors")    return <Vendors />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Portfolio() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {buildings.map((b) => {
        const bUnits = units.filter((u) => u.buildingId === b.id);
        const occ = bUnits.filter((u) => u.status === "Occupied").length;
        return (
          <Card key={b.id} padding="p-0" className="overflow-hidden">
            <div className="aspect-[16/8] bg-gradient-to-br from-slate-300 to-slate-200 relative">
              <div className="absolute top-3 left-3"><Badge tone="slate">{b.units} unit{b.units > 1 ? "s" : ""}</Badge></div>
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-mono">{occ}/{bUnits.length} occ</div>
            </div>
            <div className="p-4">
              <p className="text-base font-semibold text-slate-900">{b.name}</p>
              <p className="text-xs text-slate-500">{b.address} · {b.city}, {b.state}</p>
              <p className="text-xs text-slate-500 mt-1">Owner: {b.ownerEntity}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div><p className="font-bold text-slate-900">{fmtCompact(b.marketValue)}</p><p>Market</p></div>
                <div><p className="font-bold text-slate-900">{fmtCompact(b.monthlyRent)}</p><p>Rent</p></div>
                <div><p className="font-bold text-slate-900">{b.insurer}</p><p>Insurer</p></div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function RentRoll() {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Unit</th>
            <th className="text-left px-5 py-3 font-semibold">Building</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
            <th className="text-left px-5 py-3 font-semibold">Specs</th>
            <th className="text-left px-5 py-3 font-semibold">Tenant</th>
            <th className="text-right px-5 py-3 font-semibold">Rent</th>
            <th className="text-right px-5 py-3 font-semibold">Lease ends</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {units.map((u) => {
            const b = buildings.find((b) => b.id === u.buildingId)!;
            const t = tenants.find((t) => t.id === u.tenantId);
            const tone = u.status === "Occupied" ? "emerald" : u.status === "Vacant" ? "red" : u.status === "Notice Given" ? "amber" : "purple";
            return (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{u.label}</td>
                <td className="px-5 py-3 text-slate-700 text-xs">{b.name}</td>
                <td className="px-5 py-3"><Badge tone={tone}>{u.status}</Badge></td>
                <td className="px-5 py-3 text-slate-600 text-xs">{u.beds}bd · {u.baths}ba · {u.sqft} sf</td>
                <td className="px-5 py-3 text-slate-700">{t?.name ?? "—"}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-900">{fmt(u.rent)}</td>
                <td className="px-5 py-3 text-right text-slate-500 text-xs">{u.leaseEndsOn ? new Date(u.leaseEndsOn).toLocaleDateString() : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function Tenants() {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Tenant</th>
            <th className="text-left px-5 py-3 font-semibold">Lease term</th>
            <th className="text-right px-5 py-3 font-semibold">Rent</th>
            <th className="text-right px-5 py-3 font-semibold">Deposit held</th>
            <th className="text-left px-5 py-3 font-semibold">Payment</th>
            <th className="text-left px-5 py-3 font-semibold">Renters' ins.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tenants.map((t) => {
            const u = units.find((u) => u.id === t.unitId);
            const payTone = t.paymentStatus === "Current" ? "emerald" : t.paymentStatus === "Late 1-7d" ? "amber" : "red";
            const insTone = t.rentersInsurance === "Verified" ? "emerald" : t.rentersInsurance === "Expired" ? "amber" : "red";
            return (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.email} · {u?.label}{t.cotenant ? ` + co-tenant ${t.cotenant}` : ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600 text-xs">{new Date(t.leaseStart).toLocaleDateString()} → {new Date(t.leaseEnd).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-900">{fmt(t.rent)}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-700">{fmt(t.deposit)}</td>
                <td className="px-5 py-3"><Badge tone={payTone}>{t.paymentStatus}</Badge></td>
                <td className="px-5 py-3"><Badge tone={insTone}>{t.rentersInsurance}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function Maintenance() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {maintenanceTickets.map((m) => {
        const u = units.find((u) => u.id === m.unitId);
        const b = u && buildings.find((b) => b.id === u.buildingId);
        const priorityTone = m.priority === "Emergency" ? "red" : m.priority === "High" ? "amber" : m.priority === "Med" ? "blue" : "slate";
        const statusTone = m.status === "Resolved" ? "emerald" : m.status === "In Progress" ? "amber" : "slate";
        return (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-mono text-slate-400">{m.id}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{b?.name} · {u?.label}</p>
              </div>
              <Badge tone={priorityTone}>{m.priority}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Badge tone={statusTone}>{m.status}</Badge>
              <span className="text-slate-500">{m.vendor ?? "Unassigned"}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Compliance() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {regionRules.map((r) => (
        <Card key={r.region}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-900">{r.region}</h3>
            <Badge tone="slate">{r.scope}</Badge>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {r.rules.map((rl) => (
              <li key={rl} className="flex gap-2"><span className="text-amber-500 mt-0.5">●</span><span>{rl}</span></li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function Vendors() {
  const vendors = [
    { name: "Texas Cool HVAC",    trade: "HVAC",       rating: 4.8, jobs: 22, contact: "(817) 555-0301" },
    { name: "Goldstar Plumbing",  trade: "Plumbing",   rating: 4.9, jobs: 31, contact: "(817) 555-0418" },
    { name: "Northside Electric", trade: "Electrical", rating: 4.6, jobs: 14, contact: "(817) 555-0555" },
    { name: "Atrium Originals (PM)", trade: "Turnover", rating: 5.0, jobs: 9,  contact: "(817) 555-0099" },
    { name: "Sunbelt Roofing",    trade: "Roof",       rating: 4.4, jobs: 4,  contact: "(817) 555-0188" },
    { name: "Magnolia Pest",      trade: "Pest",       rating: 4.7, jobs: 12, contact: "(817) 555-0264" },
  ];
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Vendor</th>
            <th className="text-left px-5 py-3 font-semibold">Trade</th>
            <th className="text-right px-5 py-3 font-semibold">Rating</th>
            <th className="text-right px-5 py-3 font-semibold">Jobs YTD</th>
            <th className="text-left px-5 py-3 font-semibold">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendors.map((v) => (
            <tr key={v.name} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{v.name}</td>
              <td className="px-5 py-3 text-slate-600">{v.trade}</td>
              <td className="px-5 py-3 text-right font-mono text-amber-600">{v.rating.toFixed(1)} ★</td>
              <td className="px-5 py-3 text-right text-slate-700">{v.jobs}</td>
              <td className="px-5 py-3 font-mono text-slate-600 text-xs">{v.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
