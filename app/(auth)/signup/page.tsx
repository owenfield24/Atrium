"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProfile, type Role, type PlanId, type UserProfile } from "@/lib/profile";
import { REGIONS } from "@/lib/brief/regions";
import { pricingTiers } from "@/lib/saas/data";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const ROLE_OPTIONS: { id: Role; title: string; blurb: string; icon: string }[] = [
  { id: "agent-solo",   title: "Solo agent",            blurb: "Independent licensed agent. Just you and your clients.",                                  icon: "👤" },
  { id: "agent-agency", title: "Agency / brokerage",    blurb: "You run or are part of a brokerage with multiple agents.",                                icon: "🏢" },
  { id: "landlord",     title: "Landlord / property mgr.", blurb: "You own or manage rental properties — residential, commercial, or mixed.",            icon: "🏠" },
];

const PLAN_BY_ROLE: Record<Role, PlanId[]> = {
  "agent-solo":   ["starter", "pro"],
  "agent-agency": ["pro", "agency", "enterprise"],
  "landlord":     ["agency"], // mapped to "Keystone" tier below
};

const PLAN_MAP: { id: PlanId; tierId: string }[] = [
  { id: "starter",    tierId: "skylight"    },
  { id: "pro",        tierId: "courtyard"   },
  { id: "agency",     tierId: "keystone"    },
  { id: "scale",      tierId: "atrium"      },
  { id: "enterprise", tierId: "foundation"  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // — Form state —
  const [role, setRole]               = useState<Role | null>(null);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [address, setAddress]         = useState("");
  const [city, setCity]               = useState("");
  const [stateCode, setStateCode]     = useState("TX");
  const [regionSlug, setRegionSlug]   = useState<string>("dfw");

  // role-specific
  const [agencyName, setAgencyName]   = useState("");
  const [agencyLicense, setAgencyLicense] = useState("");
  const [agencyAgentCount, setAgencyAgentCount] = useState(5);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState]   = useState("TX");
  const [brokerageName, setBrokerageName] = useState("");
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);

  const [doors, setDoors] = useState(5);
  const [propertyType, setPropertyType] = useState<"residential" | "commercial" | "mixed">("residential");

  const [plan, setPlan] = useState<PlanId>("pro");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const regionOptions = useMemo(
    () => Object.values(REGIONS).map((r) => ({ slug: r.slug, label: r.label, state: r.state })),
    []
  );
  const planOptions = useMemo(
    () => (role ? PLAN_BY_ROLE[role] : []).map((id) => {
      const tierId = PLAN_MAP.find((p) => p.id === id)?.tierId;
      const tier = pricingTiers.find((t) => t.id === tierId);
      return { id, tier };
    }).filter((p): p is { id: PlanId; tier: NonNullable<typeof p.tier> } => !!p.tier),
    [role]
  );

  const next = () => setStep((s) => Math.min(6, (s + 1) as Step));
  const back = () => setStep((s) => Math.max(1, (s - 1) as Step));

  const canAdvance: Record<Step, boolean> = {
    1: !!role,
    2: !!firstName && !!lastName && /.+@.+\..+/.test(email) && phone.replace(/\D/g, "").length >= 10,
    3: !!address && !!city && !!stateCode && !!regionSlug,
    4: role === "agent-solo"   ? !!licenseNumber && licenseConfirmed
     : role === "agent-agency" ? !!agencyName && !!agencyLicense && agencyAgentCount > 0
     : role === "landlord"     ? doors > 0
     : false,
    5: !!plan,
    6: verifyCode.length === 6,
  };

  function finish() {
    setVerifyError(null);
    // Mock verification: accept any 6-digit code OR the canonical "123456".
    if (!/^\d{6}$/.test(verifyCode)) {
      setVerifyError("Enter the 6-digit code we sent.");
      return;
    }
    const region = REGIONS[regionSlug];
    const profile: UserProfile = {
      email, firstName, lastName, phone,
      address, city, state: stateCode,
      regionSlug, regionLabel: region?.label ?? regionSlug,
      role: role!, plan,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      ...(role === "agent-solo" && {
        agent: { licenseNumber, licenseState, brokerageName, licenseConfirmed },
      }),
      ...(role === "agent-agency" && {
        agency: { name: agencyName, license: agencyLicense, state: stateCode, agentCount: agencyAgentCount },
      }),
      ...(role === "landlord" && {
        landlord: { doors, propertyType },
      }),
    };
    saveProfile(profile);
    router.push("/dashboard");
  }

  return (
    <div>
      <ProgressBar step={step} total={6} />

      <div className="mt-8 bg-white rounded-3xl border border-line p-7 md:p-10 shadow-sm">
        {step === 1 && (
          <Step title="Who are you signing up as?" subtitle="We'll tailor the dashboard to match.">
            <div className="grid md:grid-cols-3 gap-3 mt-2">
              {ROLE_OPTIONS.map((r) => {
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`text-left rounded-2xl border p-5 transition ${
                      active ? "border-ink shadow-md bg-amber-50/60" : "border-line hover:border-amber-300"
                    }`}
                  >
                    <div className="text-3xl">{r.icon}</div>
                    <p className="mt-3 text-base font-semibold text-ink">{r.title}</p>
                    <p className="mt-1 text-xs text-mute leading-relaxed">{r.blurb}</p>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="The basics." subtitle="Your name, the email we'll send the verification code to, and a phone number.">
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Field label="First name"><Input value={firstName} onChange={setFirstName} placeholder="Tyrone" autoFocus /></Field>
              <Field label="Last name"><Input value={lastName} onChange={setLastName} placeholder="Mitchell" /></Field>
              <Field label="Email"><Input value={email} onChange={setEmail} placeholder="you@brokerage.com" type="email" /></Field>
              <Field label="Phone"><Input value={phone} onChange={setPhone} placeholder="(512) 555-0188" type="tel" /></Field>
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Where do you do most of your business?" subtitle="We'll lead the Brief with this region's market data.">
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Field label="Street address"><Input value={address} onChange={setAddress} placeholder="2300 Westlake Dr, Ste 400" /></Field>
              <Field label="City"><Input value={city} onChange={setCity} placeholder="Austin" /></Field>
              <Field label="State">
                <Select value={stateCode} onChange={setStateCode} options={US_STATES.map((s) => ({ value: s, label: s }))} />
              </Field>
              <Field label="Primary region (for the Brief)">
                <Select
                  value={regionSlug}
                  onChange={setRegionSlug}
                  options={regionOptions.map((r) => ({ value: r.slug, label: `${r.label} · ${r.state}` }))}
                />
              </Field>
            </div>
          </Step>
        )}

        {step === 4 && role === "agent-solo" && (
          <Step title="Agent details." subtitle="Your license info — we use this to show your real activity in compliance reports.">
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Field label="License number"><Input value={licenseNumber} onChange={setLicenseNumber} placeholder="0612345" /></Field>
              <Field label="License state">
                <Select value={licenseState} onChange={setLicenseState} options={US_STATES.map((s) => ({ value: s, label: s }))} />
              </Field>
              <Field label="Sponsoring brokerage" className="md:col-span-2">
                <Input value={brokerageName} onChange={setBrokerageName} placeholder="Atrium Realty Group" />
              </Field>
              <label className="md:col-span-2 mt-2 flex items-start gap-3 text-sm text-mute cursor-pointer">
                <input
                  type="checkbox"
                  checked={licenseConfirmed}
                  onChange={(e) => setLicenseConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line accent-amber-600"
                />
                <span>
                  I confirm the license info above is mine and I am an actively-licensed real estate agent in good standing.
                  <span className="block text-[11px] text-mute/80 mt-1">
                    We will verify against the state license registry on first sign-in. Misrepresentation is a violation of our terms.
                  </span>
                </span>
              </label>
            </div>
          </Step>
        )}

        {step === 4 && role === "agent-agency" && (
          <Step title="Agency details." subtitle="Tell us about the brokerage so seats and compliance reports route correctly.">
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Field label="Agency name" className="md:col-span-2"><Input value={agencyName} onChange={setAgencyName} placeholder="Atrium Realty Group" /></Field>
              <Field label="Brokerage license #"><Input value={agencyLicense} onChange={setAgencyLicense} placeholder="9001234" /></Field>
              <Field label="Number of agents">
                <Input value={String(agencyAgentCount)} onChange={(v) => setAgencyAgentCount(Math.max(1, Number(v) || 1))} type="number" />
              </Field>
            </div>
          </Step>
        )}

        {step === 4 && role === "landlord" && (
          <Step title="Property details." subtitle="A starting estimate is fine — you can adjust later.">
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Field label="Number of doors / units">
                <Input value={String(doors)} onChange={(v) => setDoors(Math.max(1, Number(v) || 1))} type="number" />
              </Field>
              <Field label="Primary property type">
                <Select
                  value={propertyType}
                  onChange={(v) => setPropertyType(v as typeof propertyType)}
                  options={[
                    { value: "residential", label: "Residential" },
                    { value: "commercial",  label: "Commercial"  },
                    { value: "mixed",       label: "Mixed"       },
                  ]}
                />
              </Field>
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Choose a plan." subtitle="You can change or cancel any time. No card needed for the demo.">
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {planOptions.map(({ id, tier }) => {
                const active = plan === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPlan(id)}
                    className={`text-left rounded-2xl border p-5 transition ${
                      active ? "border-ink shadow-md bg-amber-50/60" : "border-line hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-base font-semibold text-ink">{tier.name}</p>
                      <p className="text-sm text-mute">${tier.price}<span className="text-xs">{tier.unit}</span></p>
                    </div>
                    <p className="mt-1 text-xs text-mute">{tier.blurb}</p>
                    <ul className="mt-3 space-y-1">
                      {tier.features.slice(0, 3).map((f: string) => (
                        <li key={f} className="text-xs text-mute">— {f}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step title="Verify your email." subtitle={`We sent a 6-digit code to ${email || "your email"}. Enter it below.`}>
            <div className="mt-4">
              <Field label="Verification code">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-48 text-center text-3xl tracking-[0.6em] font-semibold tighter px-4 py-4 rounded-2xl border border-line focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </Field>
              {verifyError && <p className="mt-3 text-xs font-medium text-rose-600">{verifyError}</p>}
              <p className="mt-5 text-xs text-mute">
                Didn't get it? <button type="button" className="text-amber-700 underline-offset-4 hover:underline">Resend</button>
                <span className="mx-2 text-mute/60">·</span>
                <span className="font-mono text-mute/80">Demo tip: any 6 digits work, including 123456.</span>
              </p>
            </div>
          </Step>
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {step > 1 ? (
            <button onClick={back} className="text-sm font-medium text-mute hover:text-ink">← Back</button>
          ) : (
            <Link href="/" className="text-sm font-medium text-mute hover:text-ink">← Cancel</Link>
          )}
        </div>
        {step < 6 ? (
          <button
            disabled={!canAdvance[step]}
            onClick={next}
            className="bg-ink text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-mute disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            disabled={!canAdvance[6]}
            onClick={finish}
            className="bg-amber-500 text-ink text-sm font-semibold px-7 py-3 rounded-full hover:bg-amber-400 disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/30"
          >
            Verify & open dashboard
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-mute">
        Already have an account? <Link href="/signin" className="text-amber-700 underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-mute font-mono">
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-semibold tighter leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-mute leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = "text", autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none placeholder:text-mute/60"
    />
  );
}

function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
