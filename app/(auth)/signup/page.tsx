"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProfile, type Role, type PlanId, type UserProfile } from "@/lib/profile";
import { setSession } from "@/lib/session";
import { REGIONS } from "@/lib/brief/regions";
import { pricingTiers } from "@/lib/saas/data";
import { formatPhone } from "@/lib/utils";
import AddressInput from "@/components/ui/AddressInput";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const STEP_LABELS: Record<Step, string> = {
  1: "Account type",
  2: "Identity",
  3: "Region",
  4: "Credentials",
  5: "Plan",
  6: "Verify",
};

const ROLES: { id: Role; title: string; blurb: string; svg: ReactNode }[] = [
  {
    id: "agent-solo",
    title: "Solo agent",
    blurb: "Independent, licensed, just you and your clients.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </svg>
    ),
  },
  {
    id: "agent-agency",
    title: "Agency / brokerage",
    blurb: "You run or are part of a brokerage with multiple agents.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
        <path d="M13 13h2M13 17h2" />
      </svg>
    ),
  },
  {
    id: "landlord",
    title: "Landlord / property manager",
    blurb: "You own or manage rentals — residential, commercial, mixed.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-8 9 8" />
        <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

const PLAN_BY_ROLE: Record<Role, PlanId[]> = {
  "agent-solo":   ["starter", "pro"],
  "agent-agency": ["pro", "agency", "enterprise"],
  "landlord":     ["agency"],
};

const PLAN_MAP: { id: PlanId; tierId: string }[] = [
  { id: "starter",    tierId: "skylight"   },
  { id: "pro",        tierId: "courtyard"  },
  { id: "agency",     tierId: "keystone"   },
  { id: "scale",      tierId: "atrium"     },
  { id: "enterprise", tierId: "foundation" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [role, setRole]               = useState<Role | null>(null);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [phone, setPhone]             = useState("");
  const [address, setAddress]         = useState("");
  const [city, setCity]               = useState("");
  const [stateCode, setStateCode]     = useState("TX");
  const [zip, setZip]                 = useState("");
  const [regionSlug, setRegionSlug]   = useState<string>("dfw");

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

  const next = () => setStep((s) => Math.min(6, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const canAdvance: Record<Step, boolean> = {
    1: !!role,
    2: !!firstName && !!lastName && /.+@.+\..+/.test(email) && password.length >= 8 && phone.replace(/\D/g, "").length === 10,
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
    if (!/^\d{6}$/.test(verifyCode)) {
      setVerifyError("Enter the 6-digit code.");
      return;
    }
    const region = REGIONS[regionSlug];
    const profile: UserProfile = {
      email, password, firstName, lastName, phone,
      address, city, state: stateCode, zip,
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
    // Seed the regional spotlight to ONLY the user's primary metro so the
    // Brief opens focused on their market, not a default like DFW.
    try {
      localStorage.setItem(
        "atrium.brief.regions.v1",
        JSON.stringify({ active: regionSlug, saved: [regionSlug] })
      );
    } catch {}
    setSession(email);
    router.push("/dashboard");
  }

  return (
    <div className="w-full grid lg:grid-cols-[420px_1fr]">
      {/* — LEFT RAIL: dark, futuristic — */}
      <aside className="hidden lg:flex relative bg-ink text-white p-10 xl:p-14 flex-col overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-300/80">Atrium · Onboarding</p>
          <h2 className="mt-6 text-4xl xl:text-5xl font-semibold tighter leading-[1.0]">
            Set up your<br />operating system.
          </h2>
          <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-xs">
            Six quick steps. We'll tailor the dashboard, route your data, and verify you in under two minutes.
          </p>
        </div>

        <ol className="relative mt-12 space-y-1">
          {(Object.keys(STEP_LABELS) as unknown as Step[]).map((n) => {
            const active   = step === Number(n);
            const complete = step > Number(n);
            return (
              <li key={n} className="flex items-center gap-3 py-2">
                <span className={`flex items-center justify-center w-7 h-7 rounded-full font-mono text-[11px] font-semibold border transition-colors ${
                  complete ? "bg-amber-500 border-amber-500 text-ink"
                  : active   ? "bg-white text-ink border-white"
                  :            "bg-transparent border-white/20 text-white/40"
                }`}>
                  {complete ? "✓" : n}
                </span>
                <span className={`text-sm font-medium transition-colors ${
                  active ? "text-white" : complete ? "text-white/70" : "text-white/30"
                }`}>
                  {STEP_LABELS[Number(n) as Step]}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="relative mt-auto pt-12 text-[10px] font-mono text-white/30 tracking-wider uppercase">
          Built for the next ten years of real estate.
        </div>
      </aside>

      {/* — RIGHT PANE: form — */}
      <section className="relative flex flex-col bg-soft">
        {/* mobile-only progress */}
        <div className="lg:hidden px-6 pt-20 pb-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-mute">
            <span>Step {step} / 6 · {STEP_LABELS[step]}</span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="mt-2 h-0.5 bg-line/80 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 md:px-10 lg:px-14 xl:px-20 py-10 lg:py-16">
          <div className="w-full max-w-xl">
            {step === 1 && (
              <StepWrap
                eyebrow="Step 01 / 06"
                title="Who are you signing up as?"
                subtitle="We'll tailor the dashboard, data, and reports to match."
              >
                <div className="space-y-2">
                  {ROLES.map((r) => {
                    const active = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`w-full text-left rounded-xl border px-5 py-4 flex items-center gap-4 transition group ${
                          active
                            ? "border-ink bg-white shadow-md ring-1 ring-ink/5"
                            : "border-line bg-white hover:border-ink/40"
                        }`}
                      >
                        <span className={`flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 transition-colors ${
                          active ? "bg-ink text-white" : "bg-soft text-ink/70 group-hover:bg-ink/5"
                        }`}>
                          {r.svg}
                        </span>
                        <span className="flex-1">
                          <span className="block text-base font-semibold text-ink">{r.title}</span>
                          <span className="block text-xs text-mute mt-0.5 leading-snug">{r.blurb}</span>
                        </span>
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                          active ? "bg-ink border-ink text-white" : "border-line"
                        }`}>
                          {active && <span className="block w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 2 && (
              <StepWrap
                eyebrow="Step 02 / 06"
                title="The basics."
                subtitle="Your name, email and password for sign-in, and a phone number we can verify against."
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="First name"><Input value={firstName} onChange={setFirstName} placeholder="Alex" autoFocus /></Field>
                  <Field label="Last name"><Input value={lastName} onChange={setLastName} placeholder="Reeves" /></Field>
                  <Field label="Email" className="md:col-span-2"><Input value={email} onChange={setEmail} placeholder="you@brokerage.com" type="email" /></Field>
                  <Field label="Password" className="md:col-span-2">
                    <Input value={password} onChange={setPassword} placeholder="At least 8 characters" type="password" />
                    {password.length > 0 && password.length < 8 && (
                      <p className="mt-1.5 text-[11px] text-amber-700 font-medium">Password must be at least 8 characters.</p>
                    )}
                  </Field>
                  <Field label="Phone" className="md:col-span-2">
                    <Input
                      value={phone}
                      onChange={(v) => setPhone(formatPhone(v))}
                      placeholder="(512) 555-0188"
                      type="tel"
                    />
                  </Field>
                </div>
              </StepWrap>
            )}

            {step === 3 && (
              <StepWrap
                eyebrow="Step 03 / 06"
                title="Where do you do most of your business?"
                subtitle="We'll lead the daily Brief with your region and your national position relative to it."
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Office address" className="md:col-span-2">
                    <AddressInput
                      value={address}
                      onChange={setAddress}
                      onPick={(s) => {
                        setAddress(s.street);
                        setCity(s.city);
                        setStateCode(s.state);
                        setZip(s.zip);
                      }}
                      placeholder="Start typing — we'll suggest matches"
                    />
                  </Field>
                  <Field label="City"><Input value={city} onChange={setCity} placeholder="Austin" /></Field>
                  <Field label="State"><Select value={stateCode} onChange={setStateCode} options={US_STATES.map((s) => ({ value: s, label: s }))} /></Field>
                  <Field label="ZIP"><Input value={zip} onChange={(v) => setZip(v.replace(/\D/g, "").slice(0, 5))} placeholder="78746" /></Field>
                  <Field label="Primary metro (for the Brief)">
                    <Select
                      value={regionSlug}
                      onChange={setRegionSlug}
                      options={regionOptions.map((r) => ({ value: r.slug, label: `${r.label} · ${r.state}` }))}
                    />
                  </Field>
                </div>
              </StepWrap>
            )}

            {step === 4 && role === "agent-solo" && (
              <StepWrap
                eyebrow="Step 04 / 06"
                title="Your license."
                subtitle="We use this to populate compliance reports and verify you against the state registry."
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="License number"><Input value={licenseNumber} onChange={setLicenseNumber} placeholder="0612345" /></Field>
                  <Field label="License state"><Select value={licenseState} onChange={setLicenseState} options={US_STATES.map((s) => ({ value: s, label: s }))} /></Field>
                  <Field label="Sponsoring brokerage" className="md:col-span-2">
                    <Input value={brokerageName} onChange={setBrokerageName} placeholder="Atrium Realty Group" />
                  </Field>
                  <label className="md:col-span-2 mt-1 flex items-start gap-3 text-sm text-mute cursor-pointer p-4 rounded-xl border border-line bg-white hover:border-ink/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={licenseConfirmed}
                      onChange={(e) => setLicenseConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-line accent-amber-600"
                    />
                    <span className="leading-relaxed">
                      <span className="text-ink font-medium">I confirm</span> the license info above is mine and I am an actively-licensed real estate agent in good standing.
                      <span className="block text-[11px] text-mute mt-1">Verification runs against the state license registry on first sign-in. Misrepresentation violates our terms.</span>
                    </span>
                  </label>
                </div>
              </StepWrap>
            )}

            {step === 4 && role === "agent-agency" && (
              <StepWrap
                eyebrow="Step 04 / 06"
                title="Agency details."
                subtitle="So seats, splits, and compliance route correctly across the brokerage."
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Agency name" className="md:col-span-2"><Input value={agencyName} onChange={setAgencyName} placeholder="Atrium Realty Group" /></Field>
                  <Field label="Brokerage license #"><Input value={agencyLicense} onChange={setAgencyLicense} placeholder="9001234" /></Field>
                  <Field label="Number of agents">
                    <Input value={String(agencyAgentCount)} onChange={(v) => setAgencyAgentCount(Math.max(1, Number(v) || 1))} type="number" />
                  </Field>
                </div>
              </StepWrap>
            )}

            {step === 4 && role === "landlord" && (
              <StepWrap
                eyebrow="Step 04 / 06"
                title="Your portfolio."
                subtitle="A starting estimate is fine. You can refine doors, units, and tenants once you're in."
              >
                <div className="grid md:grid-cols-2 gap-4">
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
              </StepWrap>
            )}

            {step === 5 && (
              <StepWrap
                eyebrow="Step 05 / 06"
                title="Pick a plan."
                subtitle="Change or cancel any time. No card needed for the demo."
              >
                <div className="space-y-2">
                  {planOptions.map(({ id, tier }) => {
                    const active = plan === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPlan(id)}
                        className={`w-full text-left rounded-xl border px-5 py-4 transition ${
                          active
                            ? "border-ink bg-white shadow-md ring-1 ring-ink/5"
                            : "border-line bg-white hover:border-ink/40"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-base font-semibold text-ink">{tier.name}</p>
                          <p className="text-sm font-mono text-ink">${tier.price}<span className="text-xs text-mute">{tier.unit}</span></p>
                        </div>
                        <p className="mt-1 text-xs text-mute">{tier.blurb}</p>
                        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                          {tier.features.slice(0, 3).map((f: string) => (
                            <li key={f} className="text-[11px] text-mute">· {f}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 6 && (
              <StepWrap
                eyebrow="Step 06 / 06"
                title="Verify your email."
                subtitle={`We sent a 6-digit code to ${email || "your email"}.`}
              >
                <div>
                  <Field label="Verification code">
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-56 text-center text-3xl tracking-[0.5em] font-semibold tighter px-4 py-4 rounded-xl border border-line focus:border-ink focus:outline-none bg-white font-mono"
                      autoFocus
                    />
                  </Field>
                  {verifyError && <p className="mt-3 text-xs font-medium text-rose-600">{verifyError}</p>}
                  <p className="mt-5 text-xs text-mute">
                    Didn't get it? <button type="button" className="text-ink underline-offset-4 hover:underline font-medium">Resend</button>
                    <span className="mx-2 text-mute/60">·</span>
                    <span className="font-mono text-mute/70">demo: any 6 digits</span>
                  </p>
                </div>
              </StepWrap>
            )}

            {/* Nav */}
            <div className="mt-10 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={back} className="text-sm font-medium text-mute hover:text-ink">← Back</button>
              ) : (
                <Link href="/" className="text-sm font-medium text-mute hover:text-ink">← Cancel</Link>
              )}
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
                  className="bg-ink text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-mute disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed transition-colors"
                >
                  Verify & open dashboard
                </button>
              )}
            </div>

            <p className="mt-12 text-center text-xs text-mute">
              Already have an account? <Link href="/signin" className="text-ink underline-offset-4 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function StepWrap({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-semibold tighter leading-[1.05]">{title}</h1>
      {subtitle && <p className="mt-3 text-sm text-mute leading-relaxed max-w-md">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = "text", autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean; }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm text-ink focus:border-ink focus:outline-none placeholder:text-mute/50 transition-colors"
    />
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm text-ink focus:border-ink focus:outline-none transition-colors"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
