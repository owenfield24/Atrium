"use client";

import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  return (
    <div className="p-7">
      <Tabs
        tabs={[
          { id: "account",   label: "Account" },
          { id: "brokerage", label: "Brokerage" },
          { id: "branding",  label: "Branding" },
          { id: "notifications", label: "Notifications" },
          { id: "security",  label: "Security" },
          { id: "api",       label: "API & Webhooks" },
        ]}
      >
        {(active) => {
          if (active === "account")       return <AccountPane />;
          if (active === "brokerage")     return <BrokeragePane />;
          if (active === "branding")      return <BrandingPane />;
          if (active === "notifications") return <NotificationsPane />;
          if (active === "security")      return <SecurityPane />;
          if (active === "api")           return <ApiPane />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function Field({ label, value, hint, action }: { label: string; value: string; hint?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700 font-mono">{value}</span>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md border border-slate-200 hover:border-slate-300">
          {action ?? "Edit"}
        </button>
      </div>
    </div>
  );
}

function AccountPane() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Personal</h3>
        <Field label="Name"  value="Jordan Reeves" />
        <Field label="Email" value="sarah@atriumrealtytx.com" />
        <Field label="Phone" value="(817) 555-0142" />
        <Field label="License #" value="TX-#0719432" hint="Verified with TREC · April 2026" />
        <Field label="Time zone" value="America/Chicago" />
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Profile photo</h3>
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-slate-900 text-amber-400 font-bold text-3xl flex items-center justify-center">SM</div>
          <button className="text-xs font-semibold text-white bg-slate-900 px-3 py-1.5 rounded-md">Upload photo</button>
        </div>
      </Card>
    </div>
  );
}

function BrokeragePane() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Brokerage profile</h3>
        <Badge tone="emerald">Verified</Badge>
      </div>
      <Field label="Brokerage name" value="Atrium Realty Group" />
      <Field label="Designated Broker" value="Jordan Reeves" />
      <Field label="TREC Business Entity License" value="BE-#9217340" />
      <Field label="Address" value="3408 W 7th St, Fort Worth, TX 76107" />
      <Field label="Primary MLS" value="NTREIS" />
      <Field label="Active markets" value="DFW · Houston · CRMLS · Stellar · Bright" />
    </Card>
  );
}

function BrandingPane() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Colors</h3>
        <div className="space-y-2">
          {[
            { name: "Primary",  hex: "#0F2A47", role: "Brand navy" },
            { name: "Accent",   hex: "#F59E0B", role: "Warm amber" },
            { name: "Surface",  hex: "#F8FAFC", role: "Background" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className="w-9 h-9 rounded-md ring-1 ring-slate-200" style={{ background: c.hex }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500">{c.role}</p>
              </div>
              <span className="text-xs font-mono text-slate-600">{c.hex}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Typography</h3>
        <Field label="UI font"        value="Inter" />
        <Field label="Mono / numerals" value="JetBrains Mono" />
        <Field label="Logo lockup"     value="Brand kit v1.4" action="Replace" />
      </Card>
    </div>
  );
}

function NotificationsPane() {
  const channels = [
    { ch: "New offer received",         email: true,  sms: true,  push: true  },
    { ch: "Daily morning briefing",     email: true,  sms: false, push: true  },
    { ch: "Stalled-deal alert",         email: false, sms: false, push: true  },
    { ch: "Audit log weekly summary",   email: true,  sms: false, push: false },
    { ch: "Tenant late-payment alert",  email: true,  sms: true,  push: true  },
    { ch: "Insurance expiring soon",    email: true,  sms: false, push: true  },
  ];
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Notification</th>
            <th className="text-center px-5 py-3 font-semibold">Email</th>
            <th className="text-center px-5 py-3 font-semibold">SMS</th>
            <th className="text-center px-5 py-3 font-semibold">Push</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {channels.map((c) => (
            <tr key={c.ch}>
              <td className="px-5 py-3 text-slate-800">{c.ch}</td>
              {[c.email, c.sms, c.push].map((v, i) => (
                <td key={i} className="px-5 py-3 text-center">
                  <span className={`inline-block w-9 h-5 rounded-full p-0.5 transition-colors ${v ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${v ? "translate-x-4" : ""}`} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SecurityPane() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Authentication</h3>
        <Field label="Password" value="•••••••••••" action="Change" />
        <Field label="Two-factor (TOTP)" value="Active · Authenticator app" action="Manage" />
        <Field label="Recovery codes" value="8 of 10 unused" action="View" />
        <Field label="Sessions" value="3 active" action="Manage" />
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Compliance</h3>
        <Field label="HTTPS only" value="Enforced" action="—" />
        <Field label="Encryption at rest" value="AES-256" action="—" />
        <Field label="Audit log retention" value="7 years" action="Edit" />
        <Field label="MFA required for admins" value="On" action="Edit" />
      </Card>
    </div>
  );
}

function ApiPane() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">API keys</h3>
            <p className="text-xs text-slate-500">For programmatic access. Foundation tier only.</p>
          </div>
          <Badge tone="amber">Foundation</Badge>
        </div>
        <Field label="Live key"     value="sk_live_•••••••• cdef" action="Rotate" />
        <Field label="Sandbox key"  value="sk_test_•••••••• 2891" action="Rotate" />
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Webhooks</h3>
        <div className="space-y-2">
          {[
            { url: "https://hooks.slack.com/services/T0…", events: 4, status: "Healthy" },
            { url: "https://api.zapier.com/v2/hooks/…",     events: 7, status: "Healthy" },
          ].map((h) => (
            <div key={h.url} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-mono text-slate-700 truncate">{h.url}</p>
                <p className="text-xs text-slate-500 mt-0.5">{h.events} events subscribed</p>
              </div>
              <Badge tone="emerald">{h.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
