"use client";

import { useMemo, useState } from "react";
import { REGIONS } from "@/lib/brief/regions";
import { addHighlight, removeHighlight, togglePinHighlight, useHighlights } from "@/lib/regional-highlights";

export default function RegionalHighlights() {
  const highlights = useHighlights();
  const [adding, setAdding]       = useState(false);
  const [regionSlug, setRegionSlug] = useState<string>("dfw");
  const [note, setNote]           = useState("");

  const sorted = useMemo(() => {
    return [...highlights].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [highlights]);

  const submit = () => {
    if (!note.trim()) return;
    const region = REGIONS[regionSlug];
    addHighlight({
      regionSlug,
      regionLabel: region?.label ?? regionSlug,
      note: note.trim(),
      pinned: false,
    });
    setNote("");
    setAdding(false);
  };

  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">Regional highlights</p>
          <h3 className="mt-2 text-2xl md:text-3xl font-semibold tighter leading-tight">Notes that stay until you remove them.</h3>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm font-medium bg-ink text-white px-5 py-2.5 rounded-full hover:bg-mute"
          >
            + Add highlight
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-5 rounded-2xl bg-white border border-line p-5">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="md:col-span-1 block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">Region</span>
              <select
                value={regionSlug}
                onChange={(e) => setRegionSlug(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-line bg-white text-sm focus:border-amber-500 focus:outline-none"
              >
                {Object.values(REGIONS).map((r) => (
                  <option key={r.slug} value={r.slug}>{r.label} · {r.state}</option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2 block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">What did you notice?</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Pre-construction inventory in 78731 picked up sharply this week — three new builders on Westbrook."
                autoFocus
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-line bg-white text-sm focus:border-amber-500 focus:outline-none placeholder:text-mute/60 resize-none"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={() => { setAdding(false); setNote(""); }} className="text-sm font-medium text-mute hover:text-ink px-3 py-2 rounded-full">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!note.trim()}
              className="bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-mute disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed"
            >
              Save highlight
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {sorted.length === 0 && !adding && (
          <div className="rounded-2xl border border-dashed border-line bg-soft/40 p-8 text-center">
            <p className="text-sm text-mute">
              No highlights yet. Anything you save here stays — across sessions — until you remove it.
            </p>
          </div>
        )}
        {sorted.map((h) => (
          <div
            key={h.id}
            className={`group flex items-start gap-4 rounded-2xl border p-4 transition ${
              h.pinned ? "bg-amber-50/60 border-amber-300" : "bg-white border-line hover:border-amber-300"
            }`}
          >
            <span className={`mt-1 inline-flex w-2 h-2 rounded-full flex-shrink-0 ${h.pinned ? "bg-amber-500" : "bg-line"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{h.regionLabel}</p>
                <p className="text-[10px] text-mute font-mono">
                  {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <p className="mt-1.5 text-sm text-ink leading-snug">{h.note}</p>
            </div>
            <div className="flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => togglePinHighlight(h.id)}
                title={h.pinned ? "Unpin" : "Pin to top"}
                className="text-xs text-mute hover:text-amber-700 px-2 py-1 rounded-full hover:bg-amber-50"
              >
                {h.pinned ? "★ pinned" : "☆ pin"}
              </button>
              <button
                onClick={() => { if (confirm("Remove this highlight?")) removeHighlight(h.id); }}
                title="Remove"
                className="text-xs text-mute hover:text-rose-600 px-2 py-1 rounded-full hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
