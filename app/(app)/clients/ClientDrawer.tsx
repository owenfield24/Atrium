"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@/types";
import { fmt } from "@/lib/utils";
import { updateClient } from "@/lib/clients-store";
import { getTopMatches, type MatchResult } from "@/lib/clients-match";
import { scoreLabel } from "@/lib/mls/matching";

interface Props {
  client: Client | null;
  onClose: () => void;
}

export default function ClientDrawer({ client, onClose }: Props) {
  const [notes, setNotes]         = useState("");
  const [savedAt, setSavedAt]     = useState<Date | null>(null);
  const debounce                  = useRef<number | null>(null);

  // Sync local notes state when the selected client changes
  useEffect(() => {
    setNotes(client?.notes ?? "");
    setSavedAt(null);
  }, [client?.id]);

  // Esc closes the drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (client) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [client, onClose]);

  // Debounced auto-save of notes
  useEffect(() => {
    if (!client) return;
    if (notes === (client.notes ?? "")) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      updateClient(client.id, { notes });
      setSavedAt(new Date());
    }, 500);
    return () => { if (debounce.current) window.clearTimeout(debounce.current); };
  }, [notes, client]);

  // Top-5 matches recompute as notes change (uses the in-flight notes string,
  // not the persisted one, so users see matches react as they type).
  const matches: MatchResult[] = useMemo(() => {
    if (!client) return [];
    return getTopMatches({ ...client, notes }, 5);
  }, [client, notes]);

  if (!client) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl shadow-black/30 flex flex-col animate-slide-in"
        style={{ animation: "atrium-slide-in 280ms cubic-bezier(0.2, 0, 0.13, 1.5)" }}
      >
        <style>{`
          @keyframes atrium-slide-in {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <header className="px-7 py-5 border-b border-line flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-ink text-amber-400 font-bold text-base flex items-center justify-center flex-shrink-0">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">{client.status}</p>
              <h2 className="mt-1 text-2xl font-semibold tighter leading-tight">{client.firstName} {client.lastName}</h2>
              <p className="mt-1 text-xs text-mute truncate">
                {client.email && <span>{client.email}</span>}
                {client.email && client.phone && <span className="mx-2 text-mute/50">·</span>}
                {client.phone && <span className="font-mono">{client.phone}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-mute hover:text-ink text-2xl leading-none w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center"
          >
            ×
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* META */}
          <div className="px-7 pt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Meta label="Type"     value={client.type ?? "—"} />
            <Meta label="Budget"   value={client.budget ? fmt(client.budget) : "—"} mono />
            <Meta label="Source"   value={client.source ?? "—"} />
            <Meta label="Last contact" value={client.lastContact ? new Date(client.lastContact).toLocaleDateString() : "—"} mono />
          </div>

          {/* NOTES */}
          <section className="px-7 mt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Notes</p>
              <p className="text-[10px] font-mono text-mute">
                {savedAt
                  ? `Saved · ${savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  : notes !== (client.notes ?? "")
                    ? "Editing…"
                    : "Auto-saves as you type"}
              </p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder={
                "What's the brief on this client? Mention budget (e.g. $900k), bedrooms (4 bed), preferred area (78731, Westlake), and must-haves (pool, smart home). Matching uses these signals."
              }
              className="mt-2 w-full px-4 py-3 rounded-xl border border-line bg-soft/40 text-sm text-ink leading-relaxed focus:border-ink focus:bg-white focus:outline-none placeholder:text-mute/60 resize-y min-h-[120px]"
            />
          </section>

          {/* TOP 5 MATCHES */}
          <section className="px-7 mt-7 pb-8">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Top 5 matches</p>
                <h3 className="mt-1 text-base font-semibold tighter">Listings that fit the notes.</h3>
              </div>
              <p className="text-[10px] font-mono text-mute">Recomputes live</p>
            </div>

            {matches.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">
                No active MLS listings yet. Add notes to refine the match.
              </div>
            ) : (
              <ol className="mt-3 space-y-2">
                {matches.map((m, i) => {
                  const sLabel = scoreLabel(m.total);
                  return (
                    <li key={m.listing.mlsId} className="rounded-xl border border-line bg-white p-4 hover:border-ink/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-mute w-5">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-base font-semibold text-ink truncate">{m.listing.address}</span>
                          </div>
                          <p className="mt-1 ml-8 text-xs text-mute">
                            {m.listing.city} · {m.listing.state} {m.listing.zip} ·{" "}
                            <span className="font-mono">{m.listing.bedrooms} bd / {m.listing.bathrooms} ba / {m.listing.sqft.toLocaleString()} sf</span>
                          </p>
                          {m.reasons.length > 0 && (
                            <ul className="mt-2 ml-8 flex flex-wrap gap-x-3 gap-y-1">
                              {m.reasons.map((r) => (
                                <li key={r} className="text-[11px] text-mute">· {r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-mono font-semibold text-ink">{fmt(m.listing.listPrice)}</p>
                          <div className={`mt-1 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${sLabel.color}`}>
                            <span className="font-bold">{m.total}</span>
                            <span>· {sLabel.label}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-soft/60 border border-line/60 px-3 py-2.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-mute">{label}</p>
      <p className={`mt-0.5 text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
