import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Daily refresh of the national Brief.
 *
 * Vercel cron is UTC-only and DST-blind. We schedule TWO daily fires
 * (12:00 UTC and 13:00 UTC) and let this handler check whether it's
 * actually 8am in America/New_York right now — so the refresh always
 * lands at 8am ET regardless of EDT/EST.
 *
 * In winter (EST = UTC-5): 13:00 UTC == 8am ET → refresh fires.
 * In summer (EDT = UTC-4): 12:00 UTC == 8am ET → refresh fires.
 * The other invocation is a no-op.
 */
export async function GET(request: Request) {
  // Vercel injects this header for cron-triggered hits. When the env var is
  // set we require it; this prevents random external pings from forcing
  // revalidation. Locally / when the secret isn't set, we skip the check.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }
  }

  const etHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/New_York",
    }).format(new Date())
  );

  if (etHour !== 8) {
    return NextResponse.json({
      ok: true,
      refreshed: false,
      reason: `not-8am-et (current=${etHour})`,
    });
  }

  revalidatePath("/brief");
  return NextResponse.json({
    ok: true,
    refreshed: true,
    at: new Date().toISOString(),
  });
}
