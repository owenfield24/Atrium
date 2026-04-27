"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/types";
import { fmt, formatPhone } from "@/lib/utils";
import { useClients, updateClient, removeClient } from "@/lib/clients-store";
import { getTopMatches, type MatchResult } from "@/lib/clients-match";
import { scoreLabel } from "@/lib/mls/matching";
import { useProfile } from "@/lib/profile";
import PhotoUpload from "@/components/ui/PhotoUpload";
import {
  Section, Row, TextField, NumberField, DateField,
  SelectField, ToggleField, ChipsField,
} from "@/components/ui/InlineFields";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clients = useClients();
  const profile = useProfile();
  const client = clients.find((c) => c.id === params.id);

  const [draft, setDraft]     = useState<Client | null>(client ?? null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [editMode, setEditMode] = useState(false);
  const debounce              = useRef<number | null>(null);

  // Sync draft when the underlying client changes (id flip OR external update
  // such as the photo round-tripping after a write). The dep includes photo
  // explicitly so the sync after the localStorage event doesn't get skipped.
  useEffect(() => {
    setDraft(client ?? null);
  }, [client?.id, client?.photo]);

  const isLandlord = profile?.role === "landlord";

  // Patch helper: most fields debounce by 350ms; photo writes immediately so
  // a quick navigation doesn't lose the upload.
  const patch = (next: Partial<Client>, opts?: { immediate?: boolean }) => {
    setDraft((d) => (d ? { ...d, ...next } : d));
    if (!client) return;
    const apply = () => {
      updateClient(client.id, next);
      setSavedAt(new Date());
    };
    if (opts?.immediate) {
      if (debounce.current) window.clearTimeout(debounce.current);
      apply();
      return;
    }
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(apply, 350);
  };

  // Detect whether the client has any signal we can match against. With no
  // notes, no interaction log, no budget, and no preferences, the matcher
  // would just return arbitrary listings — so we hide the section entirely.
  const hasMatchSignal = !!draft && (
    (draft.notes?.trim()?.length ?? 0) > 0 ||
    (draft.activityLog?.length ?? 0) > 0 ||
    draft.budget != null ||
    draft.budgetMin != null ||
    draft.budgetMax != null ||
    (draft.preferences?.preferredCities?.length ?? 0) > 0 ||
    (draft.preferences?.preferredZips?.length ?? 0) > 0 ||
    (draft.preferences?.mustHaveFeatures?.length ?? 0) > 0 ||
    (draft.preferences?.minBedrooms ?? 0) > 0 ||
    (draft.preferences?.preferredTypes?.length ?? 0) > 0
  );

  const matches: MatchResult[] = useMemo(() => {
    if (!draft || isLandlord || !hasMatchSignal) return [];
    const rejected = new Set(draft.rejectedListings ?? []);
    return getTopMatches(draft, 50)            // pull a wide pool…
      .filter((m) => !rejected.has(m.listing.mlsId)) // drop user-rejected…
      .slice(0, 5);                            // then trim to 5.
  }, [draft, isLandlord, hasMatchSignal]);

  if (!client || !draft) {
    return (
      <div className="max-w-3xl mx-auto pt-16 pb-24">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">{isLandlord ? "Tenants" : "Clients"}</p>
        <h1 className="mt-3 text-3xl font-semibold tighter">Not found.</h1>
        <p className="mt-3 text-sm text-mute">This record may have been removed.</p>
        <Link href="/clients" className="mt-6 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline">← Back</Link>
      </div>
    );
  }

  const isBuyer  = !isLandlord && (draft.type === "Buyer"  || draft.type === "Both");
  const isSeller = !isLandlord && (draft.type === "Seller" || draft.type === "Both");

  const budgetDisplay =
    draft.budgetMin && draft.budgetMax  ? `${fmt(draft.budgetMin)} – ${fmt(draft.budgetMax)}` :
    draft.budgetMax                     ? fmt(draft.budgetMax) :
    draft.budgetMin                     ? `${fmt(draft.budgetMin)}+` :
    draft.budget                        ? fmt(draft.budget) :
                                          "—";

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-24">
      <div className="flex items-center justify-between gap-4">
        <Link href="/clients" className="text-sm font-medium text-mute hover:text-ink">
          ← {isLandlord ? "All tenants" : "All clients"}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-mute">
            {savedAt ? `Saved · ${savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Auto-saves"}
          </span>
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors ${
              editMode
                ? "bg-ink text-white hover:bg-mute"
                : "bg-white border border-line/80 text-ink hover:border-ink/40"
            }`}
          >
            {editMode ? "Done editing" : "Edit client info"}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header className="mt-8 flex items-start gap-7">
        <PhotoUpload
          size="lg"
          value={draft.photo}
          initials={`${draft.firstName?.[0] ?? ""}${draft.lastName?.[0] ?? ""}`.toUpperCase() || "•"}
          onChange={(dataUrl) => patch({ photo: dataUrl }, { immediate: true })}
        />
        <div className="flex-1 min-w-0 pt-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">
            {isLandlord ? (draft.applicationStatus ?? draft.status) : draft.status}
          </p>
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
        {isLandlord ? (
          <>
            <MetaTile label="Unit" value={draft.unitNumber ?? draft.unitAddress ?? "—"} />
            {editMode ? (
              <EditableTile label="Monthly rent">
                <NumberField currency value={draft.monthlyRent ?? null} onCommit={(v) => patch({ monthlyRent: v ?? undefined })} placeholder="2,300" />
              </EditableTile>
            ) : (
              <MetaTile label="Monthly rent" value={draft.monthlyRent ? fmt(draft.monthlyRent) : "—"} mono />
            )}
            <MetaTile label="Lease ends" value={draft.leaseEnd ? new Date(draft.leaseEnd).toLocaleDateString() : "—"} mono />
            <MetaTile label="Status" value={draft.applicationStatus ?? draft.status} />
          </>
        ) : (
          <>
            <MetaTile label="Type" value={draft.type ?? "—"} />
            {editMode ? (
              <EditableTile label="Budget">
                <div className="flex items-center gap-1.5">
                  <NumberField currency value={draft.budgetMin ?? null} onCommit={(v) => patch({ budgetMin: v ?? undefined })} placeholder="Min" />
                  <span className="text-mute text-xs">–</span>
                  <NumberField currency value={draft.budgetMax ?? draft.budget ?? null} onCommit={(v) => patch({ budgetMax: v ?? undefined, budget: v })} placeholder="Max" />
                </div>
              </EditableTile>
            ) : (
              <MetaTile label="Budget" value={budgetDisplay} mono />
            )}
            <MetaTile label="Source" value={draft.source ?? "—"} />
            {editMode ? (
              <EditableTile label="Last contact">
                <input
                  type="date"
                  value={draft.lastContact ?? ""}
                  onChange={(e) => patch({ lastContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-line/70 bg-white text-sm text-ink font-mono focus:border-ink focus:outline-none transition-colors"
                />
              </EditableTile>
            ) : (
              <MetaTile label="Last contact" value={draft.lastContact ? new Date(draft.lastContact).toLocaleDateString() : "—"} mono />
            )}
          </>
        )}
      </div>

      <div className={`mt-10 grid ${isLandlord ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_360px]"} gap-10`}>
        <div>
          {/* ───── COMMON ───── */}
          {/* Identity locked unless editMode is on */}
          <Section eyebrow="Identity" action={
            !editMode && <span className="text-[10px] font-mono text-mute">Locked · click "Edit client info"</span>
          }>
            {editMode ? (
              <>
                <Row label="First name"><TextField value={draft.firstName ?? ""} onCommit={(v) => patch({ firstName: v })} /></Row>
                <Row label="Last name"><TextField value={draft.lastName ?? ""} onCommit={(v) => patch({ lastName: v })} /></Row>
                <Row label="Email"><TextField type="email" value={draft.email ?? ""} onCommit={(v) => patch({ email: v })} placeholder="name@email.com" /></Row>
                <Row label="Phone">
                  <TextField type="tel" value={draft.phone ?? ""} onCommit={(v) => patch({ phone: formatPhone(v) })} placeholder="(512) 555-0188" />
                </Row>
              </>
            ) : (
              <>
                <ReadOnlyRow label="First name" value={draft.firstName} />
                <ReadOnlyRow label="Last name"  value={draft.lastName}  />
                <ReadOnlyRow label="Email"      value={draft.email}     />
                <ReadOnlyRow label="Phone"      value={draft.phone} mono />
              </>
            )}
          </Section>

          <Section eyebrow="Status & relationship" action={
            !editMode && <span className="text-[10px] font-mono text-mute">Status & type locked</span>
          }>
            {editMode ? (
              <>
                <Row label="Status">
                  <SelectField
                    value={draft.status}
                    onCommit={(v) => v && patch({ status: v })}
                    options={isLandlord ? [
                      { value: "Lead",          label: "Lead (interested)" },
                      { value: "Active Buyer",  label: "Applicant" },
                      { value: "Active Seller", label: "Active tenant" },
                      { value: "Nurture",       label: "Nurture" },
                      { value: "Closed",        label: "Past tenant" },
                    ] : [
                      { value: "Lead",          label: "Lead" },
                      { value: "Active Buyer",  label: "Active Buyer" },
                      { value: "Active Seller", label: "Active Seller" },
                      { value: "Nurture",       label: "Nurture" },
                      { value: "Closed",        label: "Past client" },
                    ]}
                  />
                </Row>
                {!isLandlord && (
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
                )}
              </>
            ) : (
              <>
                <ReadOnlyRow label="Status" value={draft.status} />
                {!isLandlord && <ReadOnlyRow label="Type" value={draft.type} />}
              </>
            )}
            <Row label="Source"><TextField value={draft.source ?? ""} onCommit={(v) => patch({ source: v })} placeholder="Referral, Open House, Zillow…" /></Row>
            <Row label="Referred by"><TextField value={draft.referredBy ?? ""} onCommit={(v) => patch({ referredBy: v })} /></Row>
            <Row label="Tags" hint="Press Enter to add a tag.">
              <ChipsField value={draft.tags} onCommit={(v) => patch({ tags: v })} placeholder="VIP, Investor, Repeat…" />
            </Row>
          </Section>

          <Section eyebrow="Notes" title="What you'd want to remember after one read.">
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={6}
              placeholder={isLandlord
                ? "Lease details, rent expectations, employment situation, prior landlords' references, anything atypical."
                : "Mention budget (e.g. $900k), bedrooms, preferred area, and must-haves. Matching uses these signals."}
              className="w-full px-4 py-3 rounded-xl border border-line bg-white/60 hover:bg-white text-sm text-ink leading-relaxed focus:border-ink focus:bg-white focus:outline-none placeholder:text-mute/60 resize-y min-h-[140px] transition-colors"
            />
          </Section>

          {/* INTERACTION LOG — feeds the matcher */}
          <InteractionLog
            entries={draft.activityLog ?? []}
            onChange={(next) => patch({ activityLog: next })}
            emphasis={isLandlord ? "tenant" : "client"}
          />

          {/* ───── LANDLORD-ONLY SECTIONS ───── */}
          {isLandlord && (
            <>
              <Section eyebrow="Lease" title="Where they live and for how long.">
                <Row label="Property address"><TextField value={draft.unitAddress ?? ""} onCommit={(v) => patch({ unitAddress: v })} /></Row>
                <Row label="Unit / apt #"><TextField value={draft.unitNumber ?? ""} onCommit={(v) => patch({ unitNumber: v })} placeholder="U-100B" /></Row>
                <Row label="Move-in"><DateField value={draft.moveInDate} onCommit={(v) => patch({ moveInDate: v })} /></Row>
                <Row label="Lease starts"><DateField value={draft.leaseStart} onCommit={(v) => patch({ leaseStart: v })} /></Row>
                <Row label="Lease ends"><DateField value={draft.leaseEnd} onCommit={(v) => patch({ leaseEnd: v })} /></Row>
                <Row label="Move-out"><DateField value={draft.moveOutDate} onCommit={(v) => patch({ moveOutDate: v })} /></Row>
              </Section>

              <Section eyebrow="Rent & deposit">
                <Row label="Monthly rent"><NumberField currency value={draft.monthlyRent ?? null} onCommit={(v) => patch({ monthlyRent: v ?? undefined })} /></Row>
                <Row label="Security deposit"><NumberField currency value={draft.securityDeposit ?? null} onCommit={(v) => patch({ securityDeposit: v ?? undefined })} /></Row>
                <Row label="Payment method">
                  <SelectField
                    value={draft.paymentMethod}
                    onCommit={(v) => patch({ paymentMethod: v })}
                    options={[
                      { value: "ACH",         label: "ACH" },
                      { value: "Check",       label: "Check" },
                      { value: "Card",        label: "Card" },
                      { value: "Cash",        label: "Cash" },
                      { value: "Money order", label: "Money order" },
                    ]}
                  />
                </Row>
                <Row label="Autopay enrolled"><ToggleField value={!!draft.autopay} onCommit={(v) => patch({ autopay: v })} /></Row>
              </Section>

              <Section eyebrow="Application & screening">
                <Row label="Application status">
                  <SelectField
                    value={draft.applicationStatus}
                    onCommit={(v) => patch({ applicationStatus: v })}
                    options={[
                      { value: "Applicant",  label: "Applicant" },
                      { value: "Pending",    label: "Pending" },
                      { value: "Approved",   label: "Approved" },
                      { value: "Denied",     label: "Denied" },
                      { value: "Withdrawn",  label: "Withdrawn" },
                    ]}
                  />
                </Row>
                <Row label="Applied on"><DateField value={draft.applicationDate} onCommit={(v) => patch({ applicationDate: v })} /></Row>
                <Row label="Background check"><ToggleField value={!!draft.backgroundCheckCompleted} onCommit={(v) => patch({ backgroundCheckCompleted: v })} /></Row>
                <Row label="Eviction history"><ToggleField value={!!draft.evictionHistory} onCommit={(v) => patch({ evictionHistory: v })} /></Row>
                <Row label="Prior housing"><TextField multiline value={draft.housingHistory ?? ""} onCommit={(v) => patch({ housingHistory: v })} placeholder="Last residence, landlord reference…" /></Row>
              </Section>

              <Section eyebrow="Insurance">
                <Row label="Renters insurance"><TextField value={draft.rentersInsuranceProvider ?? ""} onCommit={(v) => patch({ rentersInsuranceProvider: v })} placeholder="Lemonade, State Farm…" /></Row>
                <Row label="Insurance expires"><DateField value={draft.rentersInsuranceExpires} onCommit={(v) => patch({ rentersInsuranceExpires: v })} /></Row>
              </Section>

              <Section eyebrow="Emergency contact">
                <Row label="Name"><TextField value={draft.emergencyContactName ?? ""} onCommit={(v) => patch({ emergencyContactName: v })} /></Row>
                <Row label="Phone"><TextField type="tel" value={draft.emergencyContactPhone ?? ""} onCommit={(v) => patch({ emergencyContactPhone: formatPhone(v) })} /></Row>
                <Row label="Relationship"><TextField value={draft.emergencyContactRelation ?? ""} onCommit={(v) => patch({ emergencyContactRelation: v })} placeholder="Sister, parent, partner…" /></Row>
              </Section>

              <Section eyebrow="Vehicle & pets">
                <Row label="Vehicle"><TextField value={draft.vehicleInfo ?? ""} onCommit={(v) => patch({ vehicleInfo: v })} placeholder="2022 Honda CR-V · TX 8YBT123" /></Row>
                <Row label="Pets on lease"><TextField value={draft.pets ?? ""} onCommit={(v) => patch({ pets: v })} placeholder="1 dog (golden, 45 lb)" /></Row>
              </Section>

              <Section eyebrow="Employment">
                <Row label="Employer"><TextField value={draft.employer ?? ""} onCommit={(v) => patch({ employer: v })} /></Row>
                <Row label="Title"><TextField value={draft.occupation ?? ""} onCommit={(v) => patch({ occupation: v })} /></Row>
                <Row label="Annual income"><NumberField currency value={draft.annualIncome ?? null} onCommit={(v) => patch({ annualIncome: v ?? undefined })} /></Row>
              </Section>
            </>
          )}

          {/* ───── AGENT-ONLY SECTIONS ───── */}
          {isBuyer && (
            <div id="buying-preferences" />
          )}
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
              <Row label="Sqft (min – max)">
                <div className="flex items-center gap-2">
                  <NumberField value={draft.minSqft ?? null} onCommit={(v) => patch({ minSqft: v ?? undefined })} placeholder="Min" />
                  <span className="text-mute text-xs">to</span>
                  <NumberField value={draft.maxSqft ?? null} onCommit={(v) => patch({ maxSqft: v ?? undefined })} placeholder="Max" />
                </div>
              </Row>
              <Row label="Year built (min)"><NumberField value={draft.minYearBuilt ?? null} onCommit={(v) => patch({ minYearBuilt: v ?? undefined })} placeholder="2000" /></Row>
              <Row label="Garage spaces (min)"><NumberField value={draft.minGarageSpaces ?? null} onCommit={(v) => patch({ minGarageSpaces: v ?? undefined })} placeholder="2" /></Row>
              <Row label="Lot size (min, acres)"><NumberField value={draft.minLotSize ?? null} onCommit={(v) => patch({ minLotSize: v ?? undefined })} placeholder="0.25" /></Row>
              <Row label="Stories">
                <SelectField
                  value={draft.storyPreference}
                  onCommit={(v) => patch({ storyPreference: v })}
                  options={[
                    { value: "Single-story", label: "Single-story" },
                    { value: "Multi-story",  label: "Multi-story"  },
                    { value: "No preference",label: "No preference"},
                  ]}
                />
              </Row>
              <Row label="Max HOA fee (mo.)"><NumberField currency value={draft.maxHoaFee ?? null} onCommit={(v) => patch({ maxHoaFee: v ?? undefined })} /></Row>
              <Row label="Open to fixer-upper"><ToggleField value={!!draft.openToFixer} onCommit={(v) => patch({ openToFixer: v })} /></Row>
              <Row label="Property types">
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
              <Row label="Commute optimizes for"><TextField value={draft.commuteAddress ?? ""} onCommit={(v) => patch({ commuteAddress: v })} placeholder="Their workplace address" /></Row>
              <Row label="Pets"><TextField value={draft.pets ?? ""} onCommit={(v) => patch({ pets: v })} placeholder="2 dogs — needs yard" /></Row>
              <Row label="Accessibility"><TextField value={draft.accessibilityNeeds ?? ""} onCommit={(v) => patch({ accessibilityNeeds: v })} placeholder="Single-level, wide doorways…" /></Row>
              <Row label="Motivation"><TextField value={draft.motivation ?? ""} onCommit={(v) => patch({ motivation: v })} placeholder="Relocating, growing family…" /></Row>
            </Section>
          )}

          {!isLandlord && (
            <Section eyebrow="Current housing">
              <Row label="Currently">
                <SelectField
                  value={draft.currentHousing}
                  onCommit={(v) => patch({ currentHousing: v })}
                  options={[
                    { value: "Own",   label: "Owns" },
                    { value: "Rent",  label: "Rents" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </Row>
              <Row label="Current address"><TextField value={draft.currentAddress ?? ""} onCommit={(v) => patch({ currentAddress: v })} /></Row>
              <Row label="Current home value"><NumberField currency value={draft.currentHomeValue ?? null} onCommit={(v) => patch({ currentHomeValue: v ?? undefined })} /></Row>
              <Row label="Monthly housing cost"><NumberField currency value={draft.currentMonthlyHousing ?? null} onCommit={(v) => patch({ currentMonthlyHousing: v ?? undefined })} /></Row>
              <Row label="Lease ends (if renting)"><DateField value={draft.leaseEndsOn} onCommit={(v) => patch({ leaseEndsOn: v })} /></Row>
            </Section>
          )}

          {isBuyer && (
            <Section eyebrow="Financial profile">
              <Row label="Annual income"><NumberField currency value={draft.annualIncome ?? null} onCommit={(v) => patch({ annualIncome: v ?? undefined })} /></Row>
              <Row label="Down payment ready"><NumberField currency value={draft.downPayment ?? null} onCommit={(v) => patch({ downPayment: v ?? undefined })} /></Row>
              <Row label="Funds source">
                <SelectField
                  value={draft.fundsSource}
                  onCommit={(v) => patch({ fundsSource: v })}
                  options={[
                    { value: "Savings",                label: "Savings" },
                    { value: "Gift",                    label: "Gift" },
                    { value: "Sale of current home",    label: "Sale of current home" },
                    { value: "Investment",              label: "Investment / liquidation" },
                    { value: "Other",                   label: "Other" },
                  ]}
                />
              </Row>
              <Row label="Credit score range">
                <SelectField
                  value={draft.creditScoreRange}
                  onCommit={(v) => patch({ creditScoreRange: v })}
                  options={[
                    { value: "<620",     label: "Below 620" },
                    { value: "620–680",  label: "620–680" },
                    { value: "680–740",  label: "680–740" },
                    { value: "740–780",  label: "740–780" },
                    { value: "780+",     label: "780+" },
                  ]}
                />
              </Row>
              <Row label="Filing status">
                <SelectField
                  value={draft.marriedFiling}
                  onCommit={(v) => patch({ marriedFiling: v })}
                  options={[
                    { value: "Single",                          label: "Single" },
                    { value: "Married, filing jointly",         label: "Married, filing jointly" },
                    { value: "Married, filing separately",      label: "Married, filing separately" },
                  ]}
                />
              </Row>
            </Section>
          )}

          {isBuyer && (
            <Section eyebrow="Pre-approval">
              <Row label="Pre-approved"><ToggleField value={!!draft.preApproved} onCommit={(v) => patch({ preApproved: v })} /></Row>
              {draft.preApproved && (
                <>
                  <Row label="Lender"><TextField value={draft.preApprovalLender ?? ""} onCommit={(v) => patch({ preApprovalLender: v })} /></Row>
                  <Row label="Approved amount"><NumberField currency value={draft.preApprovalAmount ?? null} onCommit={(v) => patch({ preApprovalAmount: v ?? undefined })} /></Row>
                  <Row label="Expires"><DateField value={draft.preApprovalExpires} onCommit={(v) => patch({ preApprovalExpires: v })} /></Row>
                </>
              )}
            </Section>
          )}

          {!isLandlord && isBuyer && (
            <Section eyebrow="Investor profile" title="Only if applicable.">
              <Row label="Buying as investor"><ToggleField value={!!draft.isInvestor} onCommit={(v) => patch({ isInvestor: v })} /></Row>
              {draft.isInvestor && (
                <>
                  <Row label="Strategy">
                    <SelectField
                      value={draft.investorType}
                      onCommit={(v) => patch({ investorType: v })}
                      options={[
                        { value: "Flip",            label: "Flip" },
                        { value: "Buy-and-hold",    label: "Buy-and-hold" },
                        { value: "BRRRR",           label: "BRRRR" },
                        { value: "1031 exchange",   label: "1031 exchange" },
                        { value: "Other",           label: "Other" },
                      ]}
                    />
                  </Row>
                  <Row label="Target cap rate (%)"><NumberField value={draft.targetCapRate ?? null} onCommit={(v) => patch({ targetCapRate: v ?? undefined })} placeholder="6.5" /></Row>
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
                    { value: "ASAP",         label: "ASAP" },
                    { value: "0-3 months",   label: "0–3 months" },
                    { value: "3-6 months",   label: "3–6 months" },
                    { value: "6-12 months",  label: "6–12 months" },
                    { value: "Exploring",    label: "Exploring" },
                  ]}
                />
              </Row>
              <Row label="Motivation"><TextField multiline value={draft.sellingMotivation ?? ""} onCommit={(v) => patch({ sellingMotivation: v })} /></Row>
            </Section>
          )}

          {!isLandlord && (
            <Section eyebrow="Representation">
              <Row label="Buyer-broker signed"><ToggleField value={!!draft.buyerBrokerSigned} onCommit={(v) => patch({ buyerBrokerSigned: v })} /></Row>
              {draft.buyerBrokerSigned && (
                <Row label="Buyer-broker expires"><DateField value={draft.buyerBrokerExpires} onCommit={(v) => patch({ buyerBrokerExpires: v })} /></Row>
              )}
              <Row label="Listing agreement signed"><ToggleField value={!!draft.listingAgreementSigned} onCommit={(v) => patch({ listingAgreementSigned: v })} /></Row>
              {draft.listingAgreementSigned && (
                <Row label="Listing expires"><DateField value={draft.listingAgreementExpires} onCommit={(v) => patch({ listingAgreementExpires: v })} /></Row>
              )}
              <Row label="Commission rate (%)"><NumberField value={draft.commissionRate ?? null} onCommit={(v) => patch({ commissionRate: v ?? undefined })} placeholder="2.5" /></Row>
            </Section>
          )}

          {/* ───── COMMON (continued) ───── */}
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

          {!isLandlord && (
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
          )}

          <Section eyebrow="Important dates">
            <Row label="Birthday"><DateField value={draft.birthday} onCommit={(v) => patch({ birthday: v })} /></Row>
            <Row label="Anniversary"><DateField value={draft.anniversary} onCommit={(v) => patch({ anniversary: v })} /></Row>
            {!isLandlord && <Row label="Contract date"><DateField value={draft.contractDate} onCommit={(v) => patch({ contractDate: v })} /></Row>}
          </Section>
        </div>

        {/* RIGHT COLUMN — agent only, only when there's signal to match against */}
        {!isLandlord && hasMatchSignal && (
          <aside className="lg:sticky lg:top-10 self-start">
            <Section
              eyebrow="Top 5 matches"
              title="Listings ranked against this profile."
              action={<Link href="#buying-preferences" className="text-[10px] font-mono text-amber-700 hover:text-ink">Edit criteria →</Link>}
            >
              {matches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">
                  No active matches right now. Tweak the buying preferences or notes.
                </div>
              ) : (
                <ol className="space-y-2">
                  {matches.map((m, i) => {
                    const sLabel = scoreLabel(m.total);
                    return (
                      <li key={m.listing.mlsId} className="group relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm(`Remove ${m.listing.address} from this list?`)) {
                              patch({ rejectedListings: [...(draft.rejectedListings ?? []), m.listing.mlsId] });
                            }
                          }}
                          title="Remove from this list"
                          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white text-mute hover:text-rose-600 border border-line hover:border-rose-300 text-sm leading-none flex items-center justify-center"
                        >×</button>
                        <Link
                          href={`/listings/${m.listing.mlsId}`}
                          className="block rounded-xl border border-line bg-white p-4 pr-9 hover:border-ink/40 hover:shadow-md hover:shadow-amber-200/30 transition cursor-pointer"
                        >
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
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}

              {(draft.rejectedListings?.length ?? 0) > 0 && (
                <details className="mt-3 rounded-xl border border-line bg-soft/40 px-3 py-2">
                  <summary className="cursor-pointer text-[11px] font-mono text-mute hover:text-ink list-none flex items-center justify-between">
                    <span>Hidden from matches ({draft.rejectedListings!.length})</span>
                    <span>+</span>
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {draft.rejectedListings!.map((id) => (
                      <li key={id} className="flex items-center justify-between gap-2 text-xs text-mute">
                        <span className="font-mono">{id}</span>
                        <button
                          onClick={() => patch({ rejectedListings: (draft.rejectedListings ?? []).filter((x) => x !== id) })}
                          className="text-[10px] text-amber-700 hover:underline"
                        >
                          Restore
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Section>
          </aside>
        )}
      </div>

      {/* DANGER ZONE — bottom of page */}
      <div className="mt-16 pt-8 border-t border-line">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-mute">Danger zone</p>
        <div className="mt-3 flex items-center justify-between flex-wrap gap-3 rounded-xl border border-rose-100 bg-rose-50/40 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-ink">Remove this {isLandlord ? "tenant" : "client"}</p>
            <p className="text-xs text-mute mt-0.5">All notes, interactions, photo, and preferences will be deleted.</p>
          </div>
          <button
            onClick={() => {
              if (confirm(`Permanently remove ${draft.firstName} ${draft.lastName}? This can't be undone.`)) {
                removeClient(draft.id);
                router.push("/clients");
              }
            }}
            className="text-sm font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-100 px-5 py-2 rounded-full"
          >
            Remove {isLandlord ? "tenant" : "client"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-3 py-2">
      <p className="text-[11px] text-mute font-medium">{label}</p>
      <p className={`text-sm text-ink ${mono ? "font-mono" : ""}`}>{value || <span className="text-mute/60">—</span>}</p>
    </div>
  );
}

// ── Interaction log ─────────────────────────────────────────────────────
type Entry = NonNullable<Client["activityLog"]>[number];
type EntryType = Entry["type"];

const ENTRY_TYPES: { value: EntryType; label: string; tone: string }[] = [
  { value: "Call",    label: "Phone call",     tone: "bg-emerald-100 text-emerald-700" },
  { value: "Meeting", label: "In-person",      tone: "bg-amber-100 text-amber-700"     },
  { value: "Other",   label: "Zoom / video",   tone: "bg-purple-100 text-purple-700"   },
  { value: "Text",    label: "Text",           tone: "bg-blue-100 text-blue-700"       },
  { value: "Email",   label: "Email",          tone: "bg-slate-100 text-slate-700"     },
  { value: "Showing", label: "Showing",        tone: "bg-rose-100 text-rose-700"       },
  { value: "Offer",   label: "Offer / decision", tone: "bg-amber-100 text-amber-800"   },
];

function InteractionLog({
  entries, onChange, emphasis,
}: {
  entries: Entry[];
  onChange: (next: Entry[]) => void;
  emphasis: "client" | "tenant";
}) {
  const [adding, setAdding]   = useState(false);
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [type, setType]       = useState<EntryType>("Call");
  const [summary, setSummary] = useState("");

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const addEntry = () => {
    if (!summary.trim()) return;
    const next: Entry = {
      id: `IL-${Date.now().toString(36).toUpperCase()}`,
      date, type, summary: summary.trim(),
    };
    onChange([...entries, next]);
    setSummary("");
    setDate(new Date().toISOString().slice(0, 10));
    setType("Call");
    setAdding(false);
  };

  return (
    <Section
      eyebrow="Interaction log"
      title={`Calls, Zooms, in-person convos${emphasis === "client" ? " — feeds the matcher." : "."}`}
      action={
        !adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium bg-ink text-white px-3 py-1.5 rounded-full hover:bg-mute"
          >
            + Log interaction
          </button>
        )
      }
    >
      {adding && (
        <div className="rounded-xl border border-line bg-white p-4 space-y-3">
          <div className="grid sm:grid-cols-[140px_180px_1fr] gap-3 items-start">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-line/70 bg-white text-sm text-ink focus:border-ink focus:outline-none font-mono"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EntryType)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-line/70 bg-white text-sm text-ink focus:border-ink focus:outline-none"
              >
                {ENTRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">What was said</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Wants 4-bed in Westlake under $900k, must have pool. Will tour Saturday."
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-line/70 bg-white text-sm text-ink focus:border-ink focus:outline-none placeholder:text-mute/50 resize-y"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => { setAdding(false); setSummary(""); }} className="text-sm font-medium text-mute hover:text-ink px-3 py-2 rounded-full">Cancel</button>
            <button
              onClick={addEntry}
              disabled={!summary.trim()}
              className="bg-ink text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-mute disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed"
            >
              Save entry
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">
          No interactions logged yet. Drop in what you discussed on the last call or Zoom — the matcher reads it.
        </div>
      )}

      {sorted.length > 0 && (
        <ol className="space-y-2">
          {sorted.map((e) => {
            const tone = ENTRY_TYPES.find((t) => t.value === e.type);
            return (
              <li key={e.id} className="group flex items-start gap-4 rounded-xl border border-line bg-white p-4">
                <div className="flex flex-col items-center w-16 flex-shrink-0">
                  <span className="text-[10px] font-mono uppercase text-mute">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-2xl font-semibold tighter text-ink leading-none">
                    {new Date(e.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tone?.tone ?? "bg-soft text-mute"}`}>
                    {tone?.label ?? e.type}
                  </span>
                  <p className="mt-2 text-sm text-ink leading-snug whitespace-pre-wrap">{e.summary}</p>
                </div>
                <button
                  onClick={() => { if (confirm("Remove this entry?")) onChange(entries.filter((x) => x.id !== e.id)); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-mute hover:text-rose-600 text-lg leading-none w-7 h-7 rounded-full hover:bg-rose-50 flex items-center justify-center flex-shrink-0"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
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

function EditableTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-line/80 px-4 py-3 hover:border-ink/30 focus-within:border-ink transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider text-mute">{label}</p>
        <span className="text-[9px] font-mono text-mute/60">Editable</span>
      </div>
      <div className="mt-1.5">{children}</div>
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
