"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadProfile, saveProfile } from "@/lib/profile";

type Stage = "credentials" | "code";

export default function SignInPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("credentials");

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]       = useState("");
  const [error, setError]     = useState<string | null>(null);

  function submitCredentials() {
    setError(null);
    if (!/.+@.+\..+/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 1) { setError("Enter your password."); return; }

    const existing = loadProfile();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      // Real account match — verify the password if we stored one.
      if (existing.password && existing.password !== password) {
        setError("That password doesn't match the account on file.");
        return;
      }
    }
    // Either matches or it's a new demo session. Move to code stage.
    setStage("code");
  }

  function submitCode() {
    setError(null);
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code we sent."); return; }

    const existing = loadProfile();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      saveProfile({ ...existing, emailVerified: true });
    } else {
      // Lightweight demo session — minimal profile so the dashboard renders.
      saveProfile({
        email, password,
        firstName: "Demo",
        lastName: "User",
        phone: "",
        address: "",
        city: "",
        state: "TX",
        zip: "",
        regionSlug: "dfw",
        regionLabel: "Dallas–Fort Worth",
        role: "agent-solo",
        plan: "pro",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });
    }
    router.push("/dashboard");
  }

  return (
    <div className="w-full grid lg:grid-cols-[420px_1fr]">
      {/* Left rail */}
      <aside className="hidden lg:flex relative bg-ink text-white p-10 xl:p-14 flex-col overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-300/80">Atrium · Sign in</p>
          <h2 className="mt-6 text-4xl xl:text-5xl font-semibold tighter leading-[1.0]">
            Welcome back.
          </h2>
          <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-xs">
            Sign in with your email and password. We'll verify the device with a one-time code sent to your inbox.
          </p>
        </div>
        <div className="relative mt-auto pt-12 text-[10px] font-mono text-white/30 tracking-wider uppercase">
          Encrypted in transit and at rest.
        </div>
      </aside>

      {/* Form */}
      <section className="relative flex-1 flex items-center justify-center bg-soft px-6 md:px-10 lg:px-14 xl:px-20 py-20">
        <div className="w-full max-w-md">
          {stage === "credentials" ? (
            <>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Sign in</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tighter leading-[1.05]">Welcome back.</h1>
              <p className="mt-3 text-sm text-mute leading-relaxed">Enter your email and password — we'll send a verification code to confirm it's you.</p>

              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brokerage.com"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") submitCredentials(); }}
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-line bg-white text-sm text-ink focus:border-ink focus:outline-none placeholder:text-mute/50 transition-colors"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">Password</span>
                    <button type="button" className="text-[11px] text-ink hover:underline underline-offset-4">Forgot?</button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => { if (e.key === "Enter") submitCredentials(); }}
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-line bg-white text-sm text-ink focus:border-ink focus:outline-none placeholder:text-mute/50 transition-colors"
                  />
                </label>
                {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
                <button
                  onClick={submitCredentials}
                  className="w-full bg-ink text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-mute"
                >
                  Continue →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Step 02 · Verify</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tighter leading-[1.05]">Check your inbox.</h1>
              <p className="mt-3 text-sm text-mute leading-relaxed">
                We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>.
              </p>

              <div className="mt-8">
                <label className="block">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute">Verification code</span>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => { if (e.key === "Enter") submitCode(); }}
                    placeholder="• • • • • •"
                    autoFocus
                    className="mt-2 w-56 text-center text-3xl tracking-[0.5em] font-semibold tighter px-4 py-4 rounded-xl border border-line focus:border-ink focus:outline-none bg-white font-mono"
                  />
                </label>
                {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
                <p className="mt-4 text-xs text-mute">
                  Wrong email? <button type="button" onClick={() => setStage("credentials")} className="text-ink underline-offset-4 hover:underline font-medium">Go back</button>
                  <span className="mx-2 text-mute/60">·</span>
                  <span className="font-mono text-mute/70">demo: any 6 digits</span>
                </p>
                <button
                  onClick={submitCode}
                  className="mt-6 w-full bg-ink text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-mute"
                >
                  Verify & open dashboard →
                </button>
              </div>
            </>
          )}

          <p className="mt-12 text-center text-xs text-mute">
            New to Atrium? <Link href="/signup" className="text-ink underline-offset-4 hover:underline font-medium">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
