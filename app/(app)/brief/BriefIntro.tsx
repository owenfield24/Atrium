"use client";

import { useProfile } from "@/lib/profile";
import { REGIONS } from "@/lib/brief/regions";

interface BriefIntroProps {
  thirty: string;
  thirtyDelta: string;
  thirtyUp: boolean;
  monthsSupply: string;
  monthsSupplyDelta: string;
  medianPrice: string;
  medianYoy: string;
}

export default function BriefIntro(props: BriefIntroProps) {
  const profile = useProfile();
  const regionSlug  = profile?.regionSlug ?? "dfw";
  const regionLabel = profile?.regionLabel ?? "Dallas–Fort Worth";
  const region = REGIONS[regionSlug];

  const direction = props.thirtyUp ? "ticked up" : "drifted lower";
  const supplyDirection = props.monthsSupplyDelta.startsWith("▼") ? "tighter" : "loosening";

  // Personalized national paragraph that orients the day around their region.
  const intro = profile
    ? `Good morning${profile.firstName ? `, ${profile.firstName}` : ""}. Nationally, the 30-year fixed ${direction} to ${props.thirty} (${props.thirtyDelta} this week) and inventory is ${supplyDirection} — months-of-supply at ${props.monthsSupply} (${props.monthsSupplyDelta}). Median sale prices are at ${props.medianPrice} (${props.medianYoy}). Closer to home in ${regionLabel}: ${region?.headline ?? "we'll have a regional read once you set your primary region."}`
    : `Nationally, the 30-year fixed ${direction} to ${props.thirty} (${props.thirtyDelta} this week). Months-of-supply is at ${props.monthsSupply} (${props.monthsSupplyDelta}). Median sale prices: ${props.medianPrice} (${props.medianYoy}). Sign in to personalize the lead with your primary region.`;

  return (
    <section className="mt-10 rounded-3xl bg-white border border-line p-8 md:p-10 relative overflow-hidden">
      <span className="absolute top-0 left-10 right-10 h-0.5 bg-amber-400" />
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/40 blur-3xl rounded-full pointer-events-none" />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">National lead · {regionLabel}</p>
      <p className="relative mt-3 text-2xl md:text-3xl text-ink leading-snug tight font-medium">
        {intro}
      </p>
      {region && (
        <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Median (regional)" value={region.medianPrice} delta={region.yoy} up={region.yoyUp} />
          <MiniStat label="Days on market"     value={region.dom} />
          <MiniStat label="Months of supply"   value={region.inventory} />
          <MiniStat label="30-day permits"     value={region.permits30d} />
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value, delta, up }: { label: string; value: string; delta?: string; up?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-soft/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">{label}</p>
      <p className="mt-1 text-xl font-semibold tighter text-ink">{value}</p>
      {delta && (
        <p className={`text-[11px] mt-0.5 font-semibold ${up ? "text-emerald-600" : "text-amber-700"}`}>{delta}</p>
      )}
    </div>
  );
}
