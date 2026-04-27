"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadProfile, saveProfile } from "@/lib/profile";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);

  function sendCode() {
    setError(null);
    if (!/.+@.+\..+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setStage("code");
  }

  function verify() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code we sent.");
      return;
    }
    // Mock: if a profile exists with this email, mark verified and continue.
    // Otherwise create a minimal profile so the dashboard has something to render.
    const existing = loadProfile();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      saveProfile({ ...existing, emailVerified: true });
    } else {
      saveProfile({
        email,
        firstName: "Demo",
        lastName: "User",
        phone: "",
        address: "",
        city: "",
        state: "TX",
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
    <div>
      <div className="bg-white rounded-3xl border border-line p-7 md:p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-semibold tighter leading-tight">Sign in to Atrium.</h1>

        {stage === "email" && (
          <div className="mt-7">
            <p className="text-sm text-mute leading-relaxed">
              Enter your email and we'll send you a 6-digit code.
            </p>
            <div className="mt-5">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brokerage.com"
                  autoFocus
                  className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none placeholder:text-mute/60"
                />
              </label>
              {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
              <button
                onClick={sendCode}
                className="mt-6 bg-ink text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-mute"
              >
                Send code
              </button>
            </div>
          </div>
        )}

        {stage === "code" && (
          <div className="mt-7">
            <p className="text-sm text-mute leading-relaxed">
              We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
            </p>
            <div className="mt-5">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">Verification code</span>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  autoFocus
                  className="mt-1.5 w-48 text-center text-3xl tracking-[0.6em] font-semibold tighter px-4 py-4 rounded-2xl border border-line focus:border-amber-500 focus:outline-none"
                />
              </label>
              {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
              <p className="mt-4 text-xs text-mute">
                Didn't get it? <button type="button" onClick={() => setStage("email")} className="text-amber-700 underline-offset-4 hover:underline">Try a different email</button>
                <span className="mx-2 text-mute/60">·</span>
                <span className="font-mono text-mute/80">Demo: any 6 digits work.</span>
              </p>
              <button
                onClick={verify}
                className="mt-6 bg-amber-500 text-ink text-sm font-semibold px-7 py-3 rounded-full hover:bg-amber-400 shadow-lg shadow-amber-500/30"
              >
                Verify & open dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-mute">
        New to Atrium? <Link href="/signup" className="text-amber-700 underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
