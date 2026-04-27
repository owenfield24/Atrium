"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, setSession } from "@/lib/session";
import { loadProfile } from "@/lib/profile";

/**
 * Gates every route inside (app)/.
 *
 * - If sessionStorage has a session token, allow.
 * - Otherwise, if localStorage has a previously-verified profile, restore
 *   the session silently so refreshes and reopened tabs don't kick the
 *   user out. Sign-out is what clears the profile flag.
 * - Otherwise, redirect to /signin with a `next` param that the signin
 *   page can use to bounce back after verification.
 *
 * Renders nothing during the check to avoid a flash of gated UI.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (getSession()) {
      setAllowed(true);
      return;
    }
    const profile = loadProfile();
    if (profile?.emailVerified && profile.email) {
      setSession(profile.email);
      setAllowed(true);
      return;
    }
    const redirect = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/signin${redirect}`);
  }, [router, pathname]);

  if (!allowed) return null;
  return <>{children}</>;
}
