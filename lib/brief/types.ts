export type Indicator = {
  label: string;
  value: string;        // formatted display value, e.g. "5.84%"
  delta?: string;       // e.g. "▼ 0.12"
  up?: boolean;         // true if value moved up
  source: string;       // "Freddie Mac PMMS"
  link?: string;        // canonical source URL
  asOf: string;         // human-readable date e.g. "Apr 24, 2026"
  live: boolean;        // true if fetched live this revalidation; false if fallback
};

export type RatePoint = {
  date: string;   // YYYY-MM-DD
  thirty: number; // 30-yr fixed
  fifteen: number;
};

export type BriefData = {
  generatedAt: string;       // ISO timestamp of this revalidation
  indicators: {
    thirty: Indicator;
    fifteen: Indicator;
    tenYr: Indicator;
    medianPrice: Indicator;
    existingSales: Indicator;
    monthsSupply: Indicator;
    permits: Indicator;
    mortgageApps: Indicator;
  };
  series52w: RatePoint[];     // last 52 weekly readings of 30-yr / 15-yr (for chart)
  fredKeyConfigured: boolean; // hint to UI whether FRED-backed indicators are live
};
