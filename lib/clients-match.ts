import type { Client, ClientPreferences, MLSListing } from "@/types";
import { mlsListings } from "@/lib/mls/data";
import { scoreListing } from "@/lib/mls/matching";

const KNOWN_CITIES = [
  "Austin", "Dallas", "Fort Worth", "Highland Park", "Houston",
  "Plano", "Frisco", "Westlake", "Round Rock", "San Antonio",
  "New York", "Brooklyn", "Miami", "Tampa", "Chicago", "Seattle",
  "Denver", "Boston", "Phoenix", "Atlanta", "Charlotte", "San Diego",
  "Los Angeles", "Beverly Hills", "Santa Monica", "Philadelphia",
];

const FEATURE_KEYWORDS: { feature: string; keywords: string[] }[] = [
  { feature: "Pool",            keywords: ["pool"] },
  { feature: "Smart Home",      keywords: ["smart home", "smart house"] },
  { feature: "Solar Panels",    keywords: ["solar"] },
  { feature: "Outdoor Kitchen", keywords: ["outdoor kitchen"] },
  { feature: "Wine Cellar",     keywords: ["wine cellar"] },
  { feature: "Game Room",       keywords: ["game room"] },
  { feature: "Media Room",      keywords: ["media room", "theater"] },
  { feature: "Guest Suite",     keywords: ["guest suite", "in-law", "casita", "mother-in-law"] },
  { feature: "3-Car Garage",    keywords: ["3-car", "three-car", "3 car"] },
  { feature: "Spa",             keywords: ["spa", "hot tub"] },
  { feature: "Fireplace",       keywords: ["fireplace"] },
];

const PROPERTY_TYPES: { type: NonNullable<ClientPreferences["preferredTypes"][number]>; keywords: string[] }[] = [
  { type: "Condo",        keywords: ["condo"] },
  { type: "Townhouse",    keywords: ["townhouse", "townhome", "town home"] },
  { type: "Multi-Family", keywords: ["duplex", "multi-family", "multifamily"] },
  { type: "Commercial",   keywords: ["commercial"] },
  { type: "Land",         keywords: ["lot", "land", "acreage"] },
  { type: "Single Family",keywords: ["single family", "house", "home", "sfh"] },
];

/**
 * Heuristic: parse free-form notes into structured preferences. Combines
 * with any explicit `preferences` already on the client. Designed to be a
 * drop-in target for an LLM extractor later — same return shape.
 */
export function extractPreferencesFromNotes(notes: string, base?: ClientPreferences, fallbackBudget?: number): ClientPreferences {
  const out: ClientPreferences = {
    maxBudget:           base?.maxBudget           ?? 0,
    minBedrooms:         base?.minBedrooms         ?? 0,
    minBathrooms:        base?.minBathrooms        ?? 0,
    preferredTypes:      [...(base?.preferredTypes      ?? [])],
    preferredCities:     [...(base?.preferredCities     ?? [])],
    preferredZips:       [...(base?.preferredZips       ?? [])],
    mustHaveFeatures:    [...(base?.mustHaveFeatures    ?? [])],
    niceToHaveFeatures:  [...(base?.niceToHaveFeatures  ?? [])],
  };

  if (notes) {
    const lower = notes.toLowerCase();

    // Budget: $900k, $1.25M, $1,500,000
    if (!out.maxBudget) {
      const m = notes.match(/\$\s?([\d,]+(?:\.\d+)?)\s?([kKmM]?)/);
      if (m) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        const suffix = (m[2] || "").toLowerCase();
        out.maxBudget =
          suffix === "m" ? num * 1_000_000 :
          suffix === "k" ? num * 1_000 :
          num;
      }
    }

    // Bedrooms: "4 bed", "4-bedroom", "4br"
    if (!out.minBedrooms) {
      const m = lower.match(/(\d+)\s*(?:-|\s)?\s*(?:bed|bedroom|br)\b/);
      if (m) out.minBedrooms = parseInt(m[1], 10);
    }
    if (!out.minBathrooms) {
      const m = lower.match(/(\d+(?:\.\d)?)\s*(?:-|\s)?\s*(?:bath|bathroom|ba)\b/);
      if (m) out.minBathrooms = parseFloat(m[1]);
    }

    // ZIP codes
    const zipMatches = Array.from(notes.matchAll(/\b(\d{5})\b/g)).map((m) => m[1]);
    for (const z of zipMatches) if (!out.preferredZips.includes(z)) out.preferredZips.push(z);

    // Cities
    for (const city of KNOWN_CITIES) {
      if (lower.includes(city.toLowerCase()) && !out.preferredCities.includes(city)) {
        out.preferredCities.push(city);
      }
    }

    // Features
    for (const { feature, keywords } of FEATURE_KEYWORDS) {
      if (keywords.some((k) => lower.includes(k)) && !out.mustHaveFeatures.includes(feature)) {
        out.mustHaveFeatures.push(feature);
      }
    }

    // Property type
    if (out.preferredTypes.length === 0) {
      for (const { type, keywords } of PROPERTY_TYPES) {
        if (keywords.some((k) => lower.includes(k))) {
          out.preferredTypes.push(type);
          break;
        }
      }
    }
  }

  // Sensible defaults so scoreListing doesn't divide-by-zero or filter out everything
  if (!out.maxBudget) out.maxBudget = fallbackBudget ?? 1_000_000_000;
  if (!out.minBedrooms) out.minBedrooms = 1;
  if (!out.minBathrooms) out.minBathrooms = 1;
  if (out.preferredTypes.length === 0) out.preferredTypes = ["Single Family", "Condo", "Townhouse"];

  return out;
}

export interface MatchResult {
  listing: MLSListing;
  total: number;
  reasons: string[];   // human-readable why-it-matches bullets
}

/** Top-N MLS listings ranked against this client's notes + structured prefs. */
export function getTopMatches(client: Client, count = 5): MatchResult[] {
  const prefs = extractPreferencesFromNotes(
    client.notes ?? "",
    client.preferences,
    client.budget ?? undefined
  );

  const scored = mlsListings
    .filter((l) => l.status === "Active" || l.status === "Coming Soon")
    .map((l) => {
      const s = scoreListing(l, prefs);
      const reasons: string[] = [];

      if (l.listPrice <= prefs.maxBudget) reasons.push(`Within budget ($${(l.listPrice / 1000).toFixed(0)}k vs $${(prefs.maxBudget / 1000).toFixed(0)}k cap)`);
      if (l.bedrooms >= prefs.minBedrooms) reasons.push(`${l.bedrooms} bed (≥${prefs.minBedrooms} requested)`);
      if (prefs.preferredCities.includes(l.city) || prefs.preferredZips.includes(l.zip)) {
        reasons.push(`In a preferred area: ${l.city} ${l.zip}`);
      }
      const matchedFeatures = prefs.mustHaveFeatures.filter((f) =>
        l.features.some((lf) => lf.toLowerCase().includes(f.toLowerCase()))
      );
      if (matchedFeatures.length) reasons.push(`Has: ${matchedFeatures.join(", ")}`);

      return { listing: l, total: s.total, reasons };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, count);

  return scored;
}
