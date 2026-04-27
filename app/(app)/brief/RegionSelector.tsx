"use client";

import { useEffect, useState } from "react";
import { REGIONS, ALL_REGION_SLUGS, DEFAULT_PRESETS } from "@/lib/brief/regions";

const STORAGE_KEY = "atrium.brief.regions.v1";

type StoredState = {
  active: string;
  saved: string[];
};

function loadState(): StoredState {
  if (typeof window === "undefined") return { active: DEFAULT_PRESETS[0], saved: [...DEFAULT_PRESETS] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const saved = Array.isArray(parsed.saved) && parsed.saved.length > 0
        ? parsed.saved.filter((s) => REGIONS[s])
        : [...DEFAULT_PRESETS];
      const active = parsed.active && REGIONS[parsed.active] && saved.includes(parsed.active)
        ? parsed.active
        : saved[0];
      return { active, saved };
    }
    // No stored state yet — seed from the signed-in user's primary metro
    // so a fresh signup opens the Brief focused on their market.
    const profileRaw = localStorage.getItem("atrium:profile:v1");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile?.regionSlug && REGIONS[profile.regionSlug]) {
          return { active: profile.regionSlug, saved: [profile.regionSlug] };
        }
      } catch { /* fall through to defaults */ }
    }
    return { active: DEFAULT_PRESETS[0], saved: [...DEFAULT_PRESETS] };
  } catch {
    return { active: DEFAULT_PRESETS[0], saved: [...DEFAULT_PRESETS] };
  }
}

export default function RegionSelector() {
  // Initial render uses defaults so the server HTML matches first paint.
  const [state, setState] = useState<StoredState>({ active: DEFAULT_PRESETS[0], saved: [...DEFAULT_PRESETS] });
  const [hydrated, setHydrated] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist on change (only after hydration to avoid clobbering with defaults)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const region = REGIONS[state.active];
  const addable = ALL_REGION_SLUGS.filter((s) => !state.saved.includes(s));

  function setActive(slug: string) {
    setState((s) => ({ ...s, active: slug }));
    setPickerOpen(false);
  }

  function removeRegion(slug: string) {
    setState((s) => {
      if (s.saved.length <= 1) return s; // keep at least one preset
      const remaining = s.saved.filter((x) => x !== slug);
      const nextActive = s.active === slug ? remaining[0] : s.active;
      return { active: nextActive, saved: remaining };
    });
  }

  function addRegion(slug: string) {
    setState((s) => ({ active: slug, saved: [...s.saved, slug] }));
    setPickerOpen(false);
  }

  return (
    <div>
      {/* PILL TABS */}
      <div className="flex items-center flex-wrap gap-2 mt-4">
        {state.saved.map((slug) => {
          const r = REGIONS[slug];
          if (!r) return null;
          const active = slug === state.active;
          const canRemove = state.saved.length > 1;
          return (
            <div key={slug} className="group relative">
              <button
                type="button"
                onClick={() => setActive(slug)}
                className={
                  "inline-flex items-center gap-2 pl-4 pr-4 py-1.5 rounded-full text-sm font-medium transition-colors " +
                  (active
                    ? "bg-ink text-white"
                    : "bg-white border border-line text-ink hover:border-amber-400 hover:bg-amber-50")
                }
              >
                <span>{r.label}</span>
                <span className={(active ? "text-amber-300" : "text-mute") + " text-[10px] font-semibold uppercase tracking-wider"}>
                  {r.state}
                </span>
              </button>
              {canRemove && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeRegion(slug); }}
                  title={`Remove ${r.label}`}
                  aria-label={`Remove ${r.label}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-600"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Add-region picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            disabled={addable.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-base leading-none">+</span> Add region
          </button>
          {pickerOpen && addable.length > 0 && (
            <div className="absolute z-20 mt-2 left-0 w-72 bg-white border border-line rounded-2xl shadow-2xl shadow-black/10 p-2 max-h-80 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-mute px-3 pt-2 pb-1">
                Pick a metro to add
              </p>
              {addable.map((slug) => {
                const r = REGIONS[slug];
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => addRegion(slug)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-sm flex items-center justify-between gap-3"
                  >
                    <span>
                      <span className="text-ink font-medium">{r.label}</span>
                      <span className="text-mute text-xs"> · {r.state}</span>
                    </span>
                    <span className="text-amber-700 font-mono text-xs">{r.medianPrice}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE REGION DETAIL */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">{region.subtitle}</p>
            <h3 className="mt-1.5 text-2xl md:text-3xl font-semibold tighter leading-tight">{region.headline}</h3>
          </div>
          <p className="text-xs text-mute font-mono">as of {region.asOf}</p>
        </div>

        {/* Top-level metro stats */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetroStat label="Median price" value={region.medianPrice} />
          <MetroStat label="YoY"          value={region.yoy} accent={region.yoyUp ? "emerald" : "amber"} />
          <MetroStat label="Median DOM"   value={region.dom} />
          <MetroStat label="Inventory"    value={region.inventory} />
          <MetroStat label="Permits 30d"  value={region.permits30d} />
        </div>

        {/* Sub-market grid */}
        <div className="mt-6 grid md:grid-cols-3 gap-3">
          {region.subMarkets.map((sm) => (
            <div key={sm.city} className="rounded-2xl border border-line bg-white p-5 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-200/30 transition">
              <p className="text-xs font-mono text-mute">{sm.city}</p>
              <p className="text-3xl font-semibold tighter mt-1 text-ink">{sm.price}</p>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">{sm.yoy} YoY</p>
              <div className="mt-4 space-y-1.5 text-xs text-mute">
                <div className="flex justify-between"><span>Median DOM</span><span className="text-ink font-medium">{sm.dom}</span></div>
                <div className="flex justify-between"><span>Inventory</span><span className="text-ink font-medium">{sm.inventory}</span></div>
                <div className="flex justify-between"><span>Sub-market</span><span className="text-ink font-medium">{sm.note}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {region.notes.map((n, i) => (
            <li key={i} className="py-3 flex items-start gap-3">
              <span className="text-amber-600 text-xl leading-none mt-0.5">·</span>
              <span className="text-base text-ink leading-snug">{n}</span>
            </li>
          ))}
        </ul>

        {/* Sources */}
        <p className="mt-4 text-[10px] text-mute font-mono">
          Sources:{" "}
          {region.sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 && " · "}
              <a href={s.href} target="_blank" rel="noopener" className="underline-offset-4 hover:underline hover:text-amber-700">{s.name}</a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function MetroStat({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "amber" }) {
  return (
    <div className="rounded-xl border border-line bg-soft p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">{label}</p>
      <p className={
        "text-2xl font-semibold tighter mt-1 " +
        (accent === "emerald" ? "text-emerald-700" : accent === "amber" ? "text-amber-700" : "text-ink")
      }>
        {value}
      </p>
    </div>
  );
}
