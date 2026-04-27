"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@/types";
import { fmt, formatPhone } from "@/lib/utils";
import { updateClient } from "@/lib/clients-store";
import { getTopMatches, type MatchResult } from "@/lib/clients-match";
import { scoreLabel } from "@/lib/mls/matching";
import {
  Section, Row, TextField, NumberField, DateField,
  SelectField, ToggleField, ChipsField,
} from "@/components/ui/InlineFields";

interface Props {
  client: Client | null;
  onClose: () => void;
}

export default function ClientDrawer({ client, onClose }: Props) {
  const [draft, setDraft]     = useState<Client | null>(client);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const debounce              = useRef<number | null>(null);

  // Reset draft when a different client is opened
  useEffect(() => {
    setDraft(client);
    setSavedAt(null);
  }, [client?.id]);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (client) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [client, onClose]);

  // Single patch helper — updates draft immediately and writes through after a short debounce
  const patch = (next: Partial<Client>) => {
    setDraft((d) => (d ? { ...d, ...next } : d));
    if (!client) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      updateClient(client.id, next);
      setSavedAt(new Date());
    }, 350);
  };

  // Top-5 matches recompute against the draft, so users see them react live
  const matches: MatchResult[] = useMemo(() => {
    if (!draft) return [];
    return getTopMatches(draft, 5);
  }, [draft]);

  if (!client || !draft) return null;

  const isBuyer  = draft.type === "Buyer"  || draft.type === "Both";
  const isSeller = draft.type === "Seller" || draft.type === "Both";

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl shadow-black/30 flex flex-col"
        style={{ animation: "atrium-slide-in 280ms cubic-bezier(0.2, 0, 0.13, 1.5)" }}
      >
        <style>{`
          @keyframes atrium-slide-in {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* HEADER */}
        <header className="px-7 py-5 border-b border-line flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-ink text-amber-400 font-bold text-base flex items-center justify-center flex-shrink-0">
              {draft.firstName[0]}{draft.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">{draft.status}</p>
              <h2 className="mt-1 text-2xl font-semibold tighter leading-tight">{draft.firstName} {draft.lastName}</h2>
              <p className="mt-1 text-xs text-mute truncate">
                {draft.email && <span>{draft.email}</span>}
                {draft.email && draft.phone && <span className="mx-2 text-mute/50">·</span>}
                {draft.phone && <span className="font-mono">{draft.phone}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[10px] font-mono text-mute">
              {savedAt ? `Saved · ${savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Auto-saves"}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-mute hover:text-ink text-2xl leading-none w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {/* IDENTITY */}
          <Section eyebrow="Identity">
            <Row label="First name"><TextField value={draft.firstName ?? ""} onCommit={(v) => patch({ firstName: v })} /></Row>
            <Row label="Last name"><TextField value={draft.lastName ?? ""} onCommit={(v) => patch({ lastName: v })} /></Row>
            <Row label="Email"><TextField type="email" value={draft.email ?? ""} onCommit={(v) => patch({ email: v })} placeholder="name@email.com" /></Row>
            <Row label="Phone">
              <TextField type="tel" value={draft.phone ?? ""} onCommit={(v) => patch({ phone: formatPhone(v) })} placeholder="(512) 555-0188" />
            </Row>
          </Section>

          {/* STATUS */}
          <Section eyebrow="Status & relationship">
            <Row label="Status">
              <SelectField
                value={draft.status}
                onCommit={(v) => v && patch({ status: v })}
                options={[
                  { value: "Lead",          label: "Lead"          },
                  { value: "Active Buyer",  label: "Active Buyer"  },
                  { value: "Active Seller", label: "Active Seller" },
                  { value: "Nurture",       label: "Nurture"       },
                  { value: "Closed",        label: "Past client"   },
                ]}
              />
            </Row>
            <Row label="Type">
              <SelectField
                value={draft.type}
                onCommit={(v) => v && patch({ type: v })}
                options={[
                  { value: "Buyer",  label: "Buyer"  },
                  { value: "Seller", label: "Seller" },
                  { value: "Both",   label: "Both"   },
                ]}
              />
            </Row>
            <Row label="Source"><TextField value={draft.source ?? ""} onCommit={(v) => patch({ source: v })} placeholder="Referral, Open House, Zillow…" /></Row>
            <Row label="Referred by"><TextField value={draft.referredBy ?? ""} onCommit={(v) => patch({ referredBy: v })} placeholder="Name of the person who introduced them" /></Row>
            <Row label="Tags" hint="Free-form. Press Enter to add.">
              <ChipsField value={draft.tags} onCommit={(v) => patch({ tags: v })} placeholder="VIP, Repeat, Investor…" />
            </Row>
          </Section>

          {/* NOTES */}
          <Section eyebrow="Notes" title="What you'd want a co-agent to know after one read.">
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={5}
              placeholder={"Mention budget (e.g. $900k), bedrooms (4 bed), preferred area (78731, Westlake), and must-haves (pool, smart home). Matching uses these signals."}
              className="w-full px-4 py-3 rounded-xl border border-line bg-soft/40 text-sm text-ink leading-relaxed focus:border-ink focus:bg-white focus:outline-none placeholder:text-mute/60 resize-y min-h-[120px]"
            />
          </Section>

          {/* BUYING PREFERENCES */}
          {isBuyer && (
            <Section eyebrow="Buying preferences" title="Used by the matcher.">
              <Row label="Budget">
                <div className="flex items-center gap-2">
                  <NumberField currency value={draft.budgetMin ?? null} onCommit={(v) => patch({ budgetMin: v ?? undefined })} placeholder="Min" />
                  <span className="text-mute text-xs">to</span>
                  <NumberField currency value={draft.budgetMax ?? draft.budget ?? null} onCommit={(v) => patch({ budgetMax: v ?? undefined, budget: v })} placeholder="Max" />
                </div>
              </Row>
              <Row label="Min bedrooms"><NumberField value={draft.preferences?.minBedrooms ?? null} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), minBedrooms: v ?? 0 } })} placeholder="3" /></Row>
              <Row label="Min bathrooms"><NumberField value={draft.preferences?.minBathrooms ?? null} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), minBathrooms: v ?? 0 } })} placeholder="2" /></Row>
              <Row label="Property types" hint="Comma-separated; e.g. Single Family, Condo">
                <ChipsField value={draft.preferences?.preferredTypes as string[] | undefined} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), preferredTypes: v as any } })} placeholder="Single Family, Condo…" />
              </Row>
              <Row label="Cities">
                <ChipsField value={draft.preferences?.preferredCities} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), preferredCities: v } })} placeholder="Austin, Westlake…" />
              </Row>
              <Row label="ZIPs">
                <ChipsField value={draft.preferences?.preferredZips} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), preferredZips: v } })} placeholder="78731, 78746…" />
              </Row>
              <Row label="Must-haves">
                <ChipsField value={draft.preferences?.mustHaveFeatures} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), mustHaveFeatures: v } })} placeholder="Pool, Smart Home, Garage…" />
              </Row>
              <Row label="Nice-to-haves">
                <ChipsField value={draft.preferences?.niceToHaveFeatures} onCommit={(v) => patch({ preferences: { ...(draft.preferences ?? emptyPrefs()), niceToHaveFeatures: v } })} placeholder="View, Yard, Wine Cellar…" />
              </Row>
              <Row label="School districts"><ChipsField value={draft.schoolDistricts} onCommit={(v) => patch({ schoolDistricts: v })} placeholder="Eanes ISD, Austin ISD…" /></Row>
              <Row label="Move-in timeline">
                <SelectField
                  value={draft.moveInTimeline}
                  onCommit={(v) => patch({ moveInTimeline: v })}
                  options={[
                    { value: "Immediate",     label: "Immediate (under 30 days)" },
                    { value: "0-3 months",    label: "0–3 months" },
                    { value: "3-6 months",    label: "3–6 months" },
                    { value: "6-12 months",   label: "6–12 months" },
                    { value: "Just looking",  label: "Just looking" },
                  ]}
                />
              </Row>
              <Row label="Motivation"><TextField value={draft.motivation ?? ""} onCommit={(v) => patch({ motivation: v })} placeholder="Relocating for work, growing family…" /></Row>
            </Section>
          )}

          {/* PRE-APPROVAL */}
          {isBuyer && (
            <Section eyebrow="Pre-approval">
              <Row label="Pre-approved">
                <ToggleField value={!!draft.preApproved} onCommit={(v) => patch({ preApproved: v })} />
              </Row>
              {draft.preApproved && (
                <>
                  <Row label="Lender"><TextField value={draft.preApprovalLender ?? ""} onCommit={(v) => patch({ preApprovalLender: v })} placeholder="First Texas Bank" /></Row>
                  <Row label="Approved amount"><NumberField currency value={draft.preApprovalAmount ?? null} onCommit={(v) => patch({ preApprovalAmount: v ?? undefined })} /></Row>
                  <Row label="Expires"><DateField value={draft.preApprovalExpires} onCommit={(v) => patch({ preApprovalExpires: v })} /></Row>
                </>
              )}
            </Section>
          )}

          {/* SELLING */}
          {isSeller && (
            <Section eyebrow="Selling">
              <Row label="Property address"><TextField value={draft.sellingAddress ?? ""} onCommit={(v) => patch({ sellingAddress: v })} placeholder="4821 Westbrook Ln" /></Row>
              <Row label="Target price"><NumberField currency value={draft.sellingTargetPrice ?? null} onCommit={(v) => patch({ sellingTargetPrice: v ?? undefined })} /></Row>
              <Row label="Timeline">
                <SelectField
                  value={draft.sellingTimeline}
                  onCommit={(v) => patch({ sellingTimeline: v })}
                  options={[
                    { value: "ASAP",          label: "ASAP" },
                    { value: "0-3 months",    label: "0–3 months" },
                    { value: "3-6 months",    label: "3–6 months" },
                    { value: "6-12 months",   label: "6–12 months" },
                    { value: "Exploring",     label: "Exploring" },
                  ]}
                />
              </Row>
              <Row label="Motivation"><TextField value={draft.sellingMotivation ?? ""} onCommit={(v) => patch({ sellingMotivation: v })} placeholder="Job relocation, downsizing, upgrading…" multiline /></Row>
            </Section>
          )}

          {/* COMMUNICATION */}
          <Section eyebrow="Communication">
            <Row label="Preferred method">
              <SelectField
                value={draft.preferredContact}
                onCommit={(v) => patch({ preferredContact: v })}
                options={[
                  { value: "Email",     label: "Email" },
                  { value: "Phone",     label: "Phone" },
                  { value: "Text",      label: "Text" },
                  { value: "In-person", label: "In-person" },
                ]}
              />
            </Row>
            <Row label="Best time"><TextField value={draft.bestTimeToContact ?? ""} onCommit={(v) => patch({ bestTimeToContact: v })} placeholder="Weekday evenings after 6pm" /></Row>
            <Row label="Last contact"><DateField value={draft.lastContact} onCommit={(v) => patch({ lastContact: v })} /></Row>
            <Row label="Last method">
              <SelectField
                value={draft.lastContactMethod}
                onCommit={(v) => patch({ lastContactMethod: v })}
                options={[
                  { value: "Email",     label: "Email" },
                  { value: "Phone",     label: "Phone" },
                  { value: "Text",      label: "Text" },
                  { value: "In-person", label: "In-person" },
                ]}
              />
            </Row>
            <Row label="Next follow-up"><DateField value={draft.nextFollowUp} onCommit={(v) => patch({ nextFollowUp: v })} /></Row>
          </Section>

          {/* PEOPLE */}
          <Section eyebrow="People">
            <Row label="Spouse"><TextField value={draft.spouseName ?? ""} onCommit={(v) => patch({ spouseName: v })} /></Row>
            <Row label="Children" hint="Names only — keep it light.">
              <ChipsField
                value={draft.children?.map((c) => (c.age ? `${c.name} (${c.age})` : c.name))}
                onCommit={(v) => patch({ children: v.map((s) => {
                  const m = s.match(/^(.*?)\s*\((\d+)\)\s*$/);
                  return m ? { name: m[1].trim(), age: parseInt(m[2], 10) } : { name: s };
                }) })}
                placeholder="Emma (8), Liam (5)"
              />
            </Row>
            <Row label="Occupation"><TextField value={draft.occupation ?? ""} onCommit={(v) => patch({ occupation: v })} placeholder="Software engineer" /></Row>
            <Row label="Employer"><TextField value={draft.employer ?? ""} onCommit={(v) => patch({ employer: v })} placeholder="Dell, Google, self-employed…" /></Row>
          </Section>

          {/* DATES */}
          <Section eyebrow="Important dates">
            <Row label="Birthday"><DateField value={draft.birthday} onCommit={(v) => patch({ birthday: v })} /></Row>
            <Row label="Anniversary"><DateField value={draft.anniversary} onCommit={(v) => patch({ anniversary: v })} /></Row>
            <Row label="Contract date"><DateField value={draft.contractDate} onCommit={(v) => patch({ contractDate: v })} /></Row>
          </Section>

          {/* MATCHES */}
          <Section eyebrow="Top 5 matches" title="Listings ranked against this profile." action={
            <span className="text-[10px] font-mono text-mute">Recomputes live</span>
          }>
            {matches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">
                Add buying preferences to see matches.
              </div>
            ) : (
              <ol className="space-y-2">
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
          </Section>
        </div>
      </aside>
    </>
  );
}

function emptyPrefs() {
  return {
    maxBudget: 0,
    minBedrooms: 0,
    minBathrooms: 0,
    preferredTypes: [] as any,
    preferredCities: [] as string[],
    preferredZips: [] as string[],
    mustHaveFeatures: [] as string[],
    niceToHaveFeatures: [] as string[],
  };
}
