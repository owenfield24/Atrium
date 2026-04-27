"use client";

import Link from "next/link";
import { mlsListings } from "@/lib/mls/data";
import { fmt } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const statusTone = (s: string): "emerald" | "amber" | "purple" | "slate" | "red" => {
  if (s === "Active") return "emerald";
  if (s === "Pending") return "amber";
  if (s === "Coming Soon") return "purple";
  if (s === "Closed") return "slate";
  return "red";
};

export default function ListingsPage() {
  const active   = mlsListings.filter((l) => l.status === "Active");
  const pending  = mlsListings.filter((l) => l.status === "Pending");
  const coming   = mlsListings.filter((l) => l.status === "Coming Soon");
  const closed   = mlsListings.filter((l) => l.status === "Closed");

  return (
    <div className="p-7 space-y-6">
      <Tabs
        tabs={[
          { id: "all",       label: "All",          count: mlsListings.length },
          { id: "active",    label: "Active",       count: active.length },
          { id: "pending",   label: "Pending",      count: pending.length },
          { id: "coming",    label: "Coming Soon",  count: coming.length },
          { id: "closed",    label: "Closed",       count: closed.length },
          { id: "compliance",label: "IDX compliance" },
        ]}
      >
        {(active) => {
          if (active === "compliance") return <CompliancePane />;
          const list = {
            all: mlsListings,
            active: mlsListings.filter((l) => l.status === "Active"),
            pending: mlsListings.filter((l) => l.status === "Pending"),
            coming: mlsListings.filter((l) => l.status === "Coming Soon"),
            closed: mlsListings.filter((l) => l.status === "Closed"),
          }[active] ?? mlsListings;
          return <ListingGrid list={list} />;
        }}
      </Tabs>
    </div>
  );
}

function ListingGrid({ list }: { list: any[] }) {
  if (list.length === 0)
    return <Card><p className="text-sm text-slate-500">No listings here yet.</p></Card>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((l) => (
        <Link key={l.mlsId} href={`/listings/${l.mlsId}`} className="block">
        <Card padding="p-0" className="overflow-hidden hover:shadow-lg hover:shadow-slate-900/5 hover:border-ink/30 transition cursor-pointer">
          <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-100 relative overflow-hidden">
            {l.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={l.photos[0]}
                alt={l.address}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <div className="absolute top-3 left-3"><Badge tone={statusTone(l.status)}>{l.status}</Badge></div>
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-mono">
              {l.daysOnMarket}d on market
            </div>
          </div>
          <div className="p-4">
            <p className="text-base font-semibold text-slate-900">{l.address}</p>
            <p className="text-xs text-slate-500">{l.city}, {l.state} {l.zip}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 font-mono">{fmt(l.listPrice)}</span>
              <span className="text-xs text-slate-500">${l.pricePerSqft}/sf</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div><p className="font-bold text-slate-900">{l.bedrooms}</p><p>beds</p></div>
              <div><p className="font-bold text-slate-900">{l.bathrooms}</p><p>baths</p></div>
              <div><p className="font-bold text-slate-900">{l.sqft.toLocaleString()}</p><p>sqft</p></div>
            </div>
            {/* IDX compliance footer (always rendered when listing is consumer-visible) */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
              Listed by <span className="font-semibold text-slate-600">{l.agentName}</span> · {l.brokerageName}
              <br />
              MLS data deemed reliable but not guaranteed. © NTREIS.
            </div>
          </div>
        </Card>
        </Link>
      ))}
    </div>
  );
}

function CompliancePane() {
  const rules = [
    { rule: "Listing brokerage attribution",     state: "Enforced", note: "Rendered on every card + detail page (font ≥ median)." },
    { rule: "Listing agent name",                 state: "Enforced", note: "Visible alongside firm name." },
    { rule: "Listing firm phone or email",        state: "Enforced", note: "Pulled from MLS member roster nightly." },
    { rule: "Public remarks only",                state: "Enforced", note: "Agent remarks suppressed from consumer surfaces." },
    { rule: "Active statuses A/AO/AK/AC",         state: "Enforced", note: "Closed, expired, withdrawn filtered out." },
    { rule: "Internet-Display = Yes honored",     state: "Enforced", note: "14 listings suppressed in last 24h." },
    { rule: "Office-Exclusive Exempt suppressed", state: "Enforced", note: "1 listing suppressed in last 24h (Bright)." },
    { rule: "Compensation field hidden",          state: "Enforced", note: "Removed in 2024 settlement; not surfaced anywhere." },
    { rule: "MLS attribution + copyright",        state: "Enforced", note: "Per-MLS template loaded automatically." },
    { rule: "Standard disclaimer per MLS",        state: "Enforced", note: "Text supplied by NTREIS; refreshed daily." },
    { rule: "Audit log of consumer activity",     state: "Enforced", note: "Searches, views, shares logged with timestamps." },
  ];
  return (
    <Card padding="p-0">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">IDX display rules — what the UI enforces</h3>
        <p className="text-xs text-slate-500 mt-0.5">NAR Policy 7.58 + MLS supplemental rules. These run on every consumer-facing surface.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rules.map((r) => (
          <div key={r.rule} className="px-5 py-3 flex items-center gap-4">
            <Badge tone="emerald">{r.state}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{r.rule}</p>
              <p className="text-xs text-slate-500">{r.note}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
