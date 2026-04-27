"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Client, MLSListing } from "@/types";
import { mlsListings } from "@/lib/mls/data";
import { fmt } from "@/lib/utils";
import { scoreListing, scoreLabel } from "@/lib/mls/matching";
import { extractPreferencesFromNotes } from "@/lib/clients-match";
import { useClients } from "@/lib/clients-store";
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
  const clients = useClients();
  const [forClientId, setForClientId] = useState<string>("");
  const forClient = clients.find((c) => c.id === forClientId) ?? null;

  const active   = mlsListings.filter((l) => l.status === "Active");
  const pending  = mlsListings.filter((l) => l.status === "Pending");
  const coming   = mlsListings.filter((l) => l.status === "Coming Soon");
  const closed   = mlsListings.filter((l) => l.status === "Closed");

  return (
    <div className="p-7 space-y-6">
      {/* Client selector — score every active listing against the chosen client */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Score against client</p>
        <select
          value={forClientId}
          onChange={(e) => setForClientId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-line/80 bg-white text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="">— Browse all listings —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName} · {c.status}
            </option>
          ))}
        </select>
        {forClient && (
          <Link
            href={`/clients/${forClient.id}`}
            className="text-[11px] font-mono text-mute hover:text-ink underline-offset-4 hover:underline"
          >
            Open profile →
          </Link>
        )}
      </div>

      {forClient ? (
        <ScoredListings client={forClient} />
      ) : (
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
            const list = ({
              all: mlsListings,
              active: mlsListings.filter((l) => l.status === "Active"),
              pending: mlsListings.filter((l) => l.status === "Pending"),
              coming: mlsListings.filter((l) => l.status === "Coming Soon"),
              closed: mlsListings.filter((l) => l.status === "Closed"),
            } as Record<string, MLSListing[]>)[active] ?? mlsListings;
            return <ListingGrid list={list} />;
          }}
        </Tabs>
      )}
    </div>
  );
}

// ── Scored mode: client picked → top-5 + scored rest ────────────────────
function ScoredListings({ client }: { client: Client }) {
  const { top, rest } = useMemo(() => {
    // Reuse the same prefs-extraction the client profile uses
    const fromLog = (client.activityLog ?? []).map((a) => a.summary).join("\n");
    const allNotes = [client.notes ?? "", fromLog].filter(Boolean).join("\n");
    const prefs = extractPreferencesFromNotes(
      allNotes,
      client.preferences,
      client.budget ?? undefined
    );
    const rejected = new Set(client.rejectedListings ?? []);
    const scored = mlsListings
      .filter((l) => l.status === "Active" || l.status === "Coming Soon")
      .filter((l) => !rejected.has(l.mlsId))
      .map((l) => ({ listing: l, score: scoreListing(l, prefs).total }))
      .sort((a, b) => b.score - a.score);
    return { top: scored.slice(0, 5), rest: scored.slice(5) };
  }, [client]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">
          Top 5 for {client.firstName} {client.lastName}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tighter">Strongest matches across the MLS.</h2>
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {top.map(({ listing, score }, i) => (
            <ScoredCard key={listing.mlsId} listing={listing} score={score} rank={i + 1} highlight />
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mute">Everything else, ranked</p>
        <h3 className="mt-2 text-xl font-semibold tighter">{rest.length} other listings.</h3>
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map(({ listing, score }) => (
            <ScoredCard key={listing.mlsId} listing={listing} score={score} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ScoredCard({ listing, score, rank, highlight }: { listing: MLSListing; score: number; rank?: number; highlight?: boolean }) {
  const sLabel = scoreLabel(score);
  return (
    <Link href={`/listings/${listing.mlsId}`} className="block">
      <Card padding="p-0" className={`overflow-hidden hover:shadow-lg transition cursor-pointer ${highlight ? "border-ink" : ""}`}>
        <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-100 relative overflow-hidden">
          {listing.photos?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.photos[0]} alt={listing.address} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          {rank != null && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-ink/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              #{String(rank).padStart(2, "0")} match
            </div>
          )}
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full">
            <span className={`text-xs font-bold font-mono ${sLabel.color}`}>{score}</span>
            <span className={`text-[9px] font-mono uppercase tracking-wider ${sLabel.color}`}>{sLabel.label}</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-base font-semibold text-slate-900">{listing.address}</p>
          <p className="text-xs text-slate-500">{listing.city}, {listing.state} {listing.zip}</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 font-mono">{fmt(listing.listPrice)}</span>
            <span className="text-xs text-slate-500">${listing.pricePerSqft}/sf</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div><p className="font-bold text-slate-900">{listing.bedrooms}</p><p>beds</p></div>
            <div><p className="font-bold text-slate-900">{listing.bathrooms}</p><p>baths</p></div>
            <div><p className="font-bold text-slate-900">{listing.sqft.toLocaleString()}</p><p>sqft</p></div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ── Default browse mode ────────────────────────────────────────────────
function ListingGrid({ list }: { list: MLSListing[] }) {
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
                <img src={l.photos[0]} alt={l.address} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
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
  ];
  return (
    <Card>
      <h3 className="text-base font-semibold text-slate-900 mb-3">IDX compliance</h3>
      <ul className="divide-y divide-slate-100">
        {rules.map((r) => (
          <li key={r.rule} className="py-3 flex items-start gap-3">
            <Badge tone="emerald">{r.state}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{r.rule}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
