"use client";

import { useEffect, useState } from "react";

export type Role        = "agent-solo" | "agent-agency" | "landlord" | "landlord-agency" | "both-solo" | "both-agency";
export type WorkType    = "agent" | "landlord" | "both";
export type Affiliation = "solo" | "agency";
export type PlanId      = "starter" | "pro" | "agency" | "scale" | "enterprise";

/** Compose role string from work type + affiliation. */
export function makeRole(workType: WorkType, affiliation: Affiliation): Role {
  if (workType === "agent")    return affiliation === "agency" ? "agent-agency"    : "agent-solo";
  if (workType === "landlord") return affiliation === "agency" ? "landlord-agency" : "landlord";
  return affiliation === "agency" ? "both-agency" : "both-solo";
}

/** Decompose role into type + affiliation (back-compat for legacy data). */
export function parseRole(role: Role | undefined): { workType: WorkType; affiliation: Affiliation } {
  switch (role) {
    case "agent-solo":      return { workType: "agent",    affiliation: "solo"   };
    case "agent-agency":    return { workType: "agent",    affiliation: "agency" };
    case "landlord":        return { workType: "landlord", affiliation: "solo"   };
    case "landlord-agency": return { workType: "landlord", affiliation: "agency" };
    case "both-solo":       return { workType: "both",     affiliation: "solo"   };
    case "both-agency":     return { workType: "both",     affiliation: "agency" };
    default:                return { workType: "agent",    affiliation: "solo"   };
  }
}

export function isAgent(role?: Role): boolean {
  const { workType } = parseRole(role);
  return workType === "agent" || workType === "both";
}
export function isLandlord(role?: Role): boolean {
  const { workType } = parseRole(role);
  return workType === "landlord" || workType === "both";
}
export function hasAgency(role?: Role): boolean {
  return parseRole(role).affiliation === "agency";
}

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
