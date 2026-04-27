"use client";

import { useEffect, useState } from "react";

/**
 * Active-session marker stored in **sessionStorage** (not localStorage), so
 * closing the tab/window forces a fresh sign-in next time even though the
 * user's profile + clients + photos persist in localStorage. Holds the
 * email of the currently signed-in user during this browser session.
 */
const KEY   = "atrium:session:v1";
const EVENT = "atrium:session-changed";

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}

export function setSession(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, email);
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useSession(): string | null {
  const [session, setSess] = useState<string | null>(null);
  useEffect(() => {
    setSess(getSession());
    const sync = () => setSess(getSession());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return session;
}
