import type { MLSListing, ClientPreferences, MatchScore } from "@/types";

export function scoreListing(listing: MLSListing, prefs: ClientPreferences): MatchScore {
  // Budget — 30 pts
  const overBy = (listing.listPrice - prefs.maxBudget) / prefs.maxBudget;
  let budget = 0;
  if (overBy <= 0) budget = 30;
  else if (overBy <= 0.1) budget = 15;
  else if (overBy <= 0.2) budget = 5;

  // Bedrooms — 20 pts
  const bdDiff = prefs.minBedrooms - listing.bedrooms;
  let bedrooms = 0;
  if (bdDiff <= 0) bedrooms = 20;
  else if (bdDiff === 1) bedrooms = 10;

  // Bathrooms — 15 pts
  const baDiff = prefs.minBathrooms - listing.bathrooms;
  let bathrooms = 0;
  if (baDiff <= 0) bathrooms = 15;
  else if (baDiff <= 0.5) bathrooms = 10;
  else if (baDiff <= 1) bathrooms = 5;

  // Property type — 15 pts
  const propertyType = prefs.preferredTypes.includes(listing.propertyType) ? 15 : 0;

  // Location — 10 pts
  const inCity = prefs.preferredCities.includes(listing.city);
  const inZip = prefs.preferredZips.includes(listing.zip);
  const location = inCity || inZip ? 10 : 0;

  // Must-have features — 10 pts
  const missing = prefs.mustHaveFeatures.filter(
    (f) => !listing.features.some((lf) => lf.toLowerCase().includes(f.toLowerCase()))
  ).length;
  let features = 0;
  if (missing === 0) features = 10;
  else if (missing === 1) features = 5;

  return {
    mlsId: listing.mlsId,
    total: budget + bedrooms + bathrooms + propertyType + location + features,
    breakdown: { budget, bedrooms, bathrooms, propertyType, location, features },
  };
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-600" };
  if (score >= 75) return { label: "Strong", color: "text-blue-600" };
  if (score >= 55) return { label: "Good", color: "text-amber-600" };
  if (score >= 35) return { label: "Fair", color: "text-orange-500" };
  return { label: "Low", color: "text-red-500" };
}
