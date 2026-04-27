"use client";

import { insights } from "@/lib/saas/data";
import { fmt, fmtCompact } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function InsightsPage() {
  const dfw = insights.filter((i) => i.city.includes("Fort Worth") || i.city.includes("Dallas"));
  const austin = insights.filter((i) => i.city.includes("Austin"));
  const yoyAvg = insights.reduce((s, i) => s + i.yoyPct, 0) / insights.length;
  const totalPermits = insights.reduce((s, i) => s + i.permitsLast30, 0);
  const totalBTR = insights.reduce((s, i) => s + i.btrPipeline, 0);

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="ZIPs covered"      value={insights.length}                  sub="DFW + ATX + DAL" />
        <StatCard label="Avg YoY price"     value={`${yoyAvg >= 0 ? "+" : ""}${yoyAvg.toFixed(1)}%`} sub="weighted across ZIPs" highlight />
        <StatCard label="Permits last 30d"  value={totalPermits}                     sub="building dept" />
        <StatCard label="BTR pipeline"      value={totalBTR}                         sub="build-to-rent" />
      </div>

      <Tabs
        tabs={[
          { id: "snapshot", label: "ZIP snapshot" },
          { id: "dfw",      label: "DFW",   count: dfw.length },
          { id: "austin",   label: "Austin", count: austin.length },
          { id: "btr",      label: "BTR pipeline" },
          { id: "off-mkt",  label: "Off-market signals" },
        ]}
      >
        {(active) => {
          if (active === "snapshot") return <Snapshot rows={insights} />;
          if (active === "dfw")      return <Snapshot rows={dfw} />;
          if (active === "austin")   return <Snapshot rows={austin} />;
          if (active === "btr")      return <BTRPipeline />;
          if (active === "off-mkt")  return <OffMarket />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Snapshot({ rows }: { rows: typeof insights }) {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">ZIP / Area</th>
            <th className="text-right px-5 py-3 font-semibold">Median price</th>
            <th className="text-right px-5 py-3 font-semibold">YoY</th>
            <th className="text-right px-5 py-3 font-semibold">Inventory</th>
            <th className="text-right px-5 py-3 font-semibold">DOM</th>
            <th className="text-right px-5 py-3 font-semibold">Permits 30d</th>
            <th className="text-right px-5 py-3 font-semibold">BTR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.zip} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <p className="font-medium text-slate-900">{r.zip}</p>
                <p className="text-xs text-slate-500">{r.city}</p>
              </td>
              <td className="px-5 py-3 text-right font-mono text-slate-900">{fmt(r.medianPrice)}</td>
              <td className="px-5 py-3 text-right">
                <span className={`font-semibold ${r.yoyPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {r.yoyPct >= 0 ? "+" : ""}{r.yoyPct.toFixed(1)}%
                </span>
              </td>
              <td className="px-5 py-3 text-right text-slate-700">{r.inventoryMonths.toFixed(1)} mo</td>
              <td className="px-5 py-3 text-right text-slate-700">{r.daysOnMarket}</td>
              <td className="px-5 py-3 text-right text-slate-700">{r.permitsLast30}</td>
              <td className="px-5 py-3 text-right">
                {r.btrPipeline > 0 ? <Badge tone="amber">{r.btrPipeline} projects</Badge> : <span className="text-slate-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function BTRPipeline() {
  const projects = [
    { name: "Crestwood at Tanglewood",  zip: "76109", units: 220, deliveryQ: "Q3 2026", developer: "Dominium" },
    { name: "Bishop Arts Yards",        zip: "75208", units: 142, deliveryQ: "Q4 2026", developer: "Hines" },
    { name: "Heights Cottages 18",      zip: "76107", units: 18,  deliveryQ: "Q1 2027", developer: "Local SFR LLC" },
    { name: "North Central BTR",        zip: "76106", units: 96,  deliveryQ: "Q2 2027", developer: "Trinity Capital" },
  ];
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Project</th>
            <th className="text-left px-5 py-3 font-semibold">ZIP</th>
            <th className="text-right px-5 py-3 font-semibold">Units</th>
            <th className="text-left px-5 py-3 font-semibold">Delivery</th>
            <th className="text-left px-5 py-3 font-semibold">Developer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((p) => (
            <tr key={p.name} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
              <td className="px-5 py-3 text-slate-700 font-mono text-xs">{p.zip}</td>
              <td className="px-5 py-3 text-right text-slate-900">{p.units}</td>
              <td className="px-5 py-3 text-slate-600 text-xs">{p.deliveryQ}</td>
              <td className="px-5 py-3 text-slate-700">{p.developer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function OffMarket() {
  const signals = [
    { addr: "612 Carlock St",      city: "Fort Worth", reason: "Probate filing + 22-yr ownership", strength: "High" },
    { addr: "418 N Tyler St",      city: "Dallas",     reason: "Building permit pulled · 90% LTV refi",  strength: "Medium" },
    { addr: "8901 Boat Club Rd",   city: "Fort Worth", reason: "Listing canceled 18 days · prior price cut",  strength: "Medium" },
    { addr: "2540 W 7th St #4B",   city: "Fort Worth", reason: "HOA delinquency · address in audit log", strength: "Low" },
  ];
  const tone = (s: string): "red" | "amber" | "blue" =>
    s === "High" ? "red" : s === "Medium" ? "amber" : "blue";
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {signals.map((s) => (
        <Card key={s.addr}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{s.addr}</p>
              <p className="text-xs text-slate-500">{s.city}</p>
              <p className="text-xs text-slate-700 mt-2">{s.reason}</p>
            </div>
            <Badge tone={tone(s.strength)}>{s.strength}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
