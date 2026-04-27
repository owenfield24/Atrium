"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/types";
import { fmt, formatPhone } from "@/lib/utils";
import { useClients, updateClient, removeClient } from "@/lib/clients-store";
import { getTopMatches, type MatchResult } from "@/lib/clients-match";
import { scoreLabel } from "@/lib/mls/matching";
import PhotoUpload from "@/components/ui/PhotoUpload";
import {
  Section, Row, TextField, NumberField, DateField,
  SelectField, ToggleField, ChipsField,
} from "@/components/ui/InlineFields";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clients = useClients();
  const client = clients.find((c) => c.id === params.id);

  const [draft, setDraft]     = useState<Client | null>(client ?? null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const debounce              = useRef<number | null>(null);

  // Reset draft when params change or seeded data first loads
  useEffect(() => {
    setDraft(client ?? null);
  }, [client?.id]);

  // Single patch helper — local state, then write-through after debounce
  const patch = (next: Partial<Client>) => {
    setDraft((d) => (d ? { ...d, ...next } : d));
    if (!client) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      updateClient(client.id, next);
      setSavedAt(new Date());
    }, 350);
  };

  // Top-5 matches recompute against the draft
  const matches: MatchResult[] = useMemo(() => {
    if (!draft) return [];
    return getTopMatches(draft, 5);
  }, [draft]);

  if (!client || !draft) {
    return (
      <div className="max-w-3xl mx-auto pt-16 pb-24">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Clients</p>
        <h1 className="mt-3 text-3xl font-semibold tighter">Client not found.</h1>
        <p className="mt-3 text-sm text-mute">This client may have been removed.</p>
        <Link href="/clients" className="mt-6 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline">
          ← Back to clients
        </Link>
      </div>
    );
  }

  const isBuyer  = draft.type === "Buyer"  || draft.type === "Both";
  const isSeller = draft.type === "Seller" || draft.type === "Both";

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-24">
      <div className="flex items-center justify-between gap-4">
        <Link href="/clients" className="text-sm font-medium text-mute hover:text-ink">
          ← All clients
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-mute">
            {savedAt ? `Saved · ${savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Auto-saves as you type"}
          </span>
          <button
            onClick={() => {
              if (confirm(`Remove ${draft.firstName} ${draft.lastName}?`)) {
                removeClient(draft.id);
                router.push("/clients");
              }
            }}
            className="text-xs font-medium text-mute hover:text-rose-600 px-3 py-1.5 rounded-full hover:bg-rose-50"
          >
            Remove client
          </button>
        </div>
      </div>

      {/* HEADER — photo + name + contact */}
      <header className="mt-8 flex items-start gap-7">
        <PhotoUpload
          size="lg"
          value={draft.photo}
          initials={`${draft.firstName?.[0] ?? ""}${draft.lastName?.[0] ?? ""}`}
          onChange={(dataUrl) => patch({ photo: dataUrl })}
        />
        <div className="flex-1 min-w-0 pt-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">{draft.status}</p>
          <h1 className="mt-2 text-5xl md:text-6xl font-semibold tighter leading-[0.95]">
            {draft.firstName} {draft.lastName}
          </h1>
          <p className="mt-3 text-sm text-mute">
            {draft.email && <span>{draft.email}</span>}
            {draft.email && draft.phone && <span className="mx-2 text-mute/50">·</span>}
            {draft.phone && <span className="font-mono">{draft.phone}</span>}
          </p>
        </div>
      </header>

      {/* META TILES */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetaTile label="Type"          value={draft.type ?? "—"} />
        <MetaTile label="Budget"        value={draft.budgetMax ?? draft.budget ? fmt((draft.budgetMax ?? draft.budget)!) : "—"} mono />
        <MetaTile label="Source"        value={draft.source ?? "—"} />
        <MetaTile label="Last contact"  value={draft.lastContact ? new Date(draft.lastContact).toLocaleDateString() : "—"} mono />
      </div>

      {/* TWO-COLUMN BODY */}
      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <Section eyebrow="Identity">
            <Row label="First name"><TextField value={draft.firstName ?? ""} onCommit={(v) => patch({ firstName: v })} /></Row>
            <Row label="Last name"><TextField value={draft.lastName ?? ""} onCommit={(v) => patch({ lastName: v })} /></Row>
            <Row label="Email"><TextField type="email" value={draft.email ?? ""} onCommit={(v) => patch({ email: v })} placeholder="name@email.com" /></Row>
            <Row label="Phone">
              <TextField type="tel" value={draft.phone ?? ""} onCommit={(v) => patch({ phone: formatPhone(v) })} placeholder="(512) 555-0188" />
            </Row>
          </Section>

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
            <Row label="Referred by"><TextField value={draft.referredBy ?? ""} onCommit={(v) => patch({ referredBy: v })} placeholder="Name of the introducer" /></Row>
            <Row label="Tags" hint="Press Enter to add a tag.">
              <ChipsField value={draft.tags} onCommit={(v) => patch({ tags: v })} placeholder="VIP, Investor, Repeat…" />
            </Row>
          </Section>

          <Section eyebrow="Notes" title="What you'd want a co-agent to know after one read.">
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={6}
              placeholder={"Mention budget (e.g. $900k), bedrooms (4 bed), preferred area (78731, Westlake), and must-haves (pool, smart home). Matching uses these signals."}
              className="w-full px-4 py-3 rounded-xl border border-line bg-soft/40 text-sm text-ink leading-relaxed focus:border-ink focus:bg-white focus:outline-none placeholder:text-mute/60 resize-y min-h-[140px]"
            />
          </Section>

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
              <Row label="Property types" hint="e.g. Single Family, Condo">
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
              <Row label="Motivation"><TextField value={draft.motivation ?? ""} onCommit={(v) => patch({ motivation: v })} placeholder="Relocating, growing family…" /></Row>
            </Section>
          )}

          {isBuyer && (
            <Section eyebrow="Pre-approval">
              <Row label="Pre-approved"><ToggleField value={!!draft.preApproved} onCommit={(v) => patch({ preApproved: v })} /></Row>
              {draft.preApproved && (
                <>
                  <Row label="Lender"><TextField value={draft.preApprovalLender ?? ""} onCommit={(v) => patch({ preApprovalLender: v })} placeholder="First Texas Bank" /></Row>
                  <Row label="Approved amount"><NumberField currency value={draft.preApprovalAmount ?? null} onCommit={(v) => patch({ preApprovalAmount: v ?? undefined })} /></Row>
                  <Row label="Expires"><DateField value={draft.preApprovalExpires} onCommit={(v) => patch({ preApprovalExpires: v })} /></Row>
                </>
              )}
            </Section>
          )}

          {isSeller && (
            <Section eyebrow="Selling">
              <Row label="Property address"><TextField value={draft.sellingAddress ?? ""} onCommit={(v) => patch({ sellingAddress: v })} /></Row>
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
              <Row label="Motivation"><TextField multiline value={draft.sellingMotivation ?? ""} onCommit={(v) => patch({ sellingMotivation: v })} /></Row>
            </Section>
          )}

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

          <Section eyebrow="People">
            <Row label="Spouse"><TextField value={draft.spouseName ?? ""} onCommit={(v) => patch({ spouseName: v })} /></Row>
            <Row label="Children" hint='e.g. "Emma (8), Liam (5)"'>
              <ChipsField
                value={draft.children?.map((c) => (c.age ? `${c.name} (${c.age})` : c.name))}
                onCommit={(v) => patch({ children: v.map((s) => {
                  const m = s.match(/^(.*?)\s*\((\d+)\)\s*$/);
                  return m ? { name: m[1].trim(), age: parseInt(m[2], 10) } : { name: s };
                }) })}
              />
            </Row>
            <Row label="Occupation"><TextField value={draft.occupation ?? ""} onCommit={(v) => patch({ occupation: v })} /></Row>
            <Row label="Employer"><TextField value={draft.employer ?? ""} onCommit={(v) => patch({ employer: v })} /></Row>
          </Section>

          <Section eyebrow="Important dates">
            <Row label="Birthday"><DateField value={draft.birthday} onCommit={(v) => patch({ birthday: v })} /></Row>
            <Row label="Anniversary"><DateField value={draft.anniversary} onCommit={(v) => patch({ anniversary: v })} /></Row>
            <Row label="Contract date"><DateField value={draft.contractDate} onCommit={(v) => patch({ contractDate: v })} /></Row>
          </Section>
        </div>

        {/* RIGHT COLUMN — sticky matches */}
        <aside className="lg:sticky lg:top-10 self-start">
          <Section eyebrow="Top 5 matches" title="Listings ranked against this profile.">
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-mute">#{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-sm font-semibold text-ink truncate">{m.listing.address}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-mute">
                            {m.listing.city} · {m.listing.zip} · <span className="font-mono">{m.listing.bedrooms}bd/{m.listing.bathrooms}ba</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono font-semibold text-ink">{fmt(m.listing.listPrice)}</p>
                          <div className={`mt-0.5 text-[10px] font-mono uppercase tracking-wider ${sLabel.color}`}>
                            <span className="font-bold">{m.total}</span> · {sLabel.label}
                          </div>
                        </div>
                      </div>
                      {m.reasons.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5">
                          {m.reasons.slice(0, 2).map((r) => (
                            <li key={r} className="text-[10px] text-mute">· {r}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </aside>
      </div>
    </div>
  );
}

function MetaTile({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-soft/60 border border-line/60 px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-mute">{label}</p>
      <p className={`mt-1 text-base text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
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
