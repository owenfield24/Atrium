"use client";

import { useEffect, useState } from "react";

export type Role = "agent-solo" | "agent-agency" | "landlord";
export type PlanId = "starter" | "pro" | "agency" | "scale" | "enterprise";

export interface UserProfile {
  email: string;
  password: string;       // mock-only; in real auth this would never be persisted client-side
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;          // 2-letter US state code
  zip: string;
  regionSlug: string;     // primary business region (matches lib/brief/regions.ts)
  regionLabel: string;
  role: Role;
  plan?: PlanId;
  agency?: {
    name: string;
    license: string;
    state: string;
    agentCount: number;
  };
  agent?: {
    licenseNumber: string;
    licenseState: string;
    brokerageName: string;
    licenseConfirmed: boolean;
  };
  landlord?: {
    doors: number;
    propertyType: "residential" | "commercial" | "mixed";
  };
  emailVerified: boolean;
  createdAt: string;
}

const KEY = "atrium:profile:v1";
const EVENT = "atrium:profile-changed";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(EVENT));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive hook: re-renders when the profile changes in this tab or another. */
export function useProfile(): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    setProfile(loadProfile());
    const handler = () => setProfile(loadProfile());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return profile;
}

export function roleLabel(r: Role): string {
  if (r === "agent-solo") return "Solo agent";
  if (r === "agent-agency") return "Agency / brokerage";
  return "Landlord";
}
