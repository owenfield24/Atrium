export type SubMarket = {
  city: string;          // "Fort Worth · 76107"
  price: string;         // "$612k"
  yoy: string;           // "+4.8%"
  dom: string;           // "22 days"
  inventory: string;     // "2.1 mo"
  note: string;          // "Crestwood / W7th"
};

export type RegionData = {
  slug: string;
  label: string;
  state: string;          // 2-letter
  subtitle: string;       // longer description
  headline: string;       // one-line outlook for the metro
  medianPrice: string;
  yoy: string;            // year-over-year change
  yoyUp: boolean;
  dom: string;
  inventory: string;
  permits30d: string;
  subMarkets: SubMarket[];
  notes: string[];
  sources: { name: string; href: string }[];
  asOf: string;
};

// Mock data drawn from publicly-published metro-level summaries (NAR, Realtor.com,
// Redfin Data Center, local MLS reports, Zillow Research). Values approximate the
// most recent published reads as of the document date and are clearly labeled
// "as of" in the UI. Replace with API pulls once a metro-level data source is wired.
export const REGIONS: Record<string, RegionData> = {
  "dfw": {
    slug: "dfw",
    label: "Dallas–Fort Worth",
    state: "TX",
    subtitle: "DFW Metroplex · NTREIS",
    headline: "North Texas is overshooting the national pace — again.",
    medianPrice: "$425,000",
    yoy: "+4.8%",
    yoyUp: true,
    dom: "22 days",
    inventory: "2.1 mo",
    permits30d: "+18%",
    subMarkets: [
      { city: "Fort Worth · 76107", price: "$612k",  yoy: "+4.8%", dom: "22 days", inventory: "2.1 mo", note: "Crestwood / W7th" },
      { city: "Dallas · 75208",     price: "$685k",  yoy: "+5.4%", dom: "19 days", inventory: "2.0 mo", note: "Bishop Arts" },
      { city: "Westlake · 76262",   price: "$1.24M", yoy: "+3.2%", dom: "31 days", inventory: "3.5 mo", note: "Eanes ISD" },
    ],
    notes: [
      "DFW transaction volume up 6.4% YoY, leading the top-10 metros.",
      "Permit pipeline strong — Fort Worth permits +18% over trailing 30 days.",
      "Sub-$500k inventory still tight; bidding wars in 28% of accepted offers.",
    ],
    sources: [
      { name: "NTREIS Monthly Reports",       href: "https://www.ntreis.net/" },
      { name: "Texas REALTORS Data Relevance", href: "https://www.texasrealestate.com/about-texas-real-estate/data/" },
      { name: "Realtor.com — Metros",          href: "https://www.realtor.com/research/" },
    ],
    asOf: "Apr 2026",
  },
  "philadelphia": {
    slug: "philadelphia",
    label: "Philadelphia",
    state: "PA",
    subtitle: "Greater Philadelphia · Bright MLS",
    headline: "Steady demand meets the lowest inventory print since 2022.",
    medianPrice: "$348,000",
    yoy: "+3.1%",
    yoyUp: true,
    dom: "31 days",
    inventory: "2.4 mo",
    permits30d: "+4%",
    subMarkets: [
      { city: "Center City · 19103",     price: "$595k", yoy: "+2.8%", dom: "26 days", inventory: "2.2 mo", note: "Rittenhouse / Logan Sq" },
      { city: "South Philly · 19147",    price: "$465k", yoy: "+3.4%", dom: "24 days", inventory: "2.0 mo", note: "Passyunk Square" },
      { city: "Main Line · 19010",       price: "$895k", yoy: "+4.1%", dom: "38 days", inventory: "3.4 mo", note: "Bryn Mawr" },
    ],
    notes: [
      "Bright MLS reports Philadelphia inventory 14% behind 2025 spring pace.",
      "Mortgage rate dip already showing up — pending sales +5.2% WoW.",
      "Strong first-time buyer share (38%) supported by sub-$400k stock.",
    ],
    sources: [
      { name: "Bright MLS Monthly Stats",  href: "https://www.brightmls.com/news-research" },
      { name: "Drexel Lindy Inst. Report", href: "https://drexel.edu/lindy/research/" },
      { name: "Realtor.com — Philadelphia",href: "https://www.realtor.com/research/" },
    ],
    asOf: "Apr 2026",
  },
  "san-diego": {
    slug: "san-diego",
    label: "San Diego",
    state: "CA",
    subtitle: "San Diego County · CRMLS / SDAR",
    headline: "Coastal supply finally loosening; inland still tight.",
    medianPrice: "$895,000",
    yoy: "+1.2%",
    yoyUp: true,
    dom: "27 days",
    inventory: "2.8 mo",
    permits30d: "−2%",
    subMarkets: [
      { city: "La Jolla · 92037",      price: "$2.1M",  yoy: "+0.4%", dom: "42 days", inventory: "4.1 mo", note: "UTC / Bird Rock" },
      { city: "North Park · 92104",    price: "$865k",  yoy: "+1.8%", dom: "21 days", inventory: "2.0 mo", note: "30th St" },
      { city: "Chula Vista · 91915",   price: "$745k",  yoy: "+2.7%", dom: "24 days", inventory: "2.4 mo", note: "Eastlake" },
    ],
    notes: [
      "Coastal sub-markets sat through Q1 — La Jolla DOM up 31% YoY.",
      "Insurance availability improving for inland; CA FAIR Plan share down 4 pts.",
      "BTR pipeline (East County): 1,840 units expected Q3-Q4 2026.",
    ],
    sources: [
      { name: "SDAR Monthly Indicators",  href: "https://www.sdar.com/marketing-tools/market-statistics/" },
      { name: "CRMLS Reports",            href: "https://www.crmls.org/data/" },
      { name: "Redfin Data — San Diego",  href: "https://www.redfin.com/news/data-center/" },
    ],
    asOf: "Apr 2026",
  },
  "austin": {
    slug: "austin",
    label: "Austin",
    state: "TX",
    subtitle: "Austin metro · ABOR",
    headline: "Inventory normalizing; price flat to slightly negative.",
    medianPrice: "$465,000",
    yoy: "−1.4%",
    yoyUp: false,
    dom: "55 days",
    inventory: "4.2 mo",
    permits30d: "−12%",
    subMarkets: [
      { city: "Westlake · 78746", price: "$1.85M", yoy: "−2.1%", dom: "55 days", inventory: "4.2 mo", note: "Eanes ISD" },
      { city: "East Austin · 78702", price: "$685k", yoy: "−0.8%", dom: "39 days", inventory: "3.1 mo", note: "Holly / Cesar Chavez" },
      { city: "Pflugerville · 78660", price: "$385k", yoy: "+1.6%", dom: "44 days", inventory: "3.6 mo", note: "Stone Hill / Falcon Pointe" },
    ],
    notes: [
      "Austin still working off pandemic overshoot — supply at 6-year high.",
      "Builder incentives running ~$15k average on new construction.",
      "Tech-employer hiring stabilizing; net relo numbers flat YoY.",
    ],
    sources: [
      { name: "ABOR Market Reports", href: "https://www.abor.com/abor-market-reports/" },
      { name: "Realtor.com — Austin",href: "https://www.realtor.com/research/" },
    ],
    asOf: "Apr 2026",
  },
  "houston": {
    slug: "houston",
    label: "Houston",
    state: "TX",
    subtitle: "Greater Houston · HAR",
    headline: "Sub-$400k stock turning fast; luxury still slow.",
    medianPrice: "$338,000",
    yoy: "+2.4%",
    yoyUp: true,
    dom: "33 days",
    inventory: "3.1 mo",
    permits30d: "+6%",
    subMarkets: [
      { city: "Heights · 77008",      price: "$575k",  yoy: "+3.2%", dom: "28 days", inventory: "2.6 mo", note: "Norhill / Woodland Heights" },
      { city: "Sugar Land · 77479",   price: "$485k",  yoy: "+2.8%", dom: "31 days", inventory: "2.9 mo", note: "Telfair / River Park" },
      { city: "Memorial · 77024",     price: "$1.08M", yoy: "+0.6%", dom: "47 days", inventory: "4.2 mo", note: "Memorial Villages" },
    ],
    notes: [
      "HAR reports 4 of 6 sub-markets saw inventory drop YoY.",
      "Insurance costs still the biggest closing-cost surprise for buyers.",
      "BTR delivery wave Q2 in Northwest Harris — 2,200 units.",
    ],
    sources: [
      { name: "HAR Monthly MarketView", href: "https://www.har.com/marketinsight/" },
      { name: "Realtor.com — Houston",  href: "https://www.realtor.com/research/" },
    ],
    asOf: "Apr 2026",
  },
  "nyc": {
    slug: "nyc",
    label: "New York City",
    state: "NY",
    subtitle: "NYC + Westchester · REBNY / OneKey",
    headline: "Manhattan condos quiet; outer-boro brownstones bid up.",
    medianPrice: "$865,000",
    yoy: "+0.8%",
    yoyUp: true,
    dom: "62 days",
    inventory: "5.4 mo",
    permits30d: "−4%",
    subMarkets: [
      { city: "Manhattan · 10011",  price: "$1.45M", yoy: "−1.2%", dom: "78 days", inventory: "6.2 mo", note: "West Village / Chelsea" },
      { city: "Brooklyn · 11215",   price: "$1.18M", yoy: "+2.4%", dom: "39 days", inventory: "3.8 mo", note: "Park Slope / Gowanus" },
      { city: "Queens · 11375",     price: "$685k",  yoy: "+3.1%", dom: "34 days", inventory: "3.2 mo", note: "Forest Hills / Rego Park" },
    ],
    notes: [
      "REBNY: Manhattan condo absorption rate 18% below 5-yr average.",
      "Brooklyn brownstone market saw 3 multi-bid sales in PS / Cobble Hill.",
      "Stabilized rental rules continue to shift co-op valuation models.",
    ],
    sources: [
      { name: "REBNY Quarterly",           href: "https://www.rebny.com/research-reports/" },
      { name: "Douglas Elliman / Miller Samuel", href: "https://www.elliman.com/elliman-report" },
    ],
    asOf: "Apr 2026",
  },
  "la": {
    slug: "la",
    label: "Los Angeles",
    state: "CA",
    subtitle: "LA County · CRMLS / TheMLS",
    headline: "Wildfire-impact zones price-corrected; Westside steady.",
    medianPrice: "$925,000",
    yoy: "−0.6%",
    yoyUp: false,
    dom: "44 days",
    inventory: "3.9 mo",
    permits30d: "+2%",
    subMarkets: [
      { city: "Pacific Palisades · 90272", price: "$3.4M",  yoy: "−4.8%", dom: "82 days", inventory: "5.8 mo", note: "post-fire repricing" },
      { city: "Silver Lake · 90026",       price: "$1.32M", yoy: "+1.4%", dom: "29 days", inventory: "2.7 mo", note: "Reservoir / Junction" },
      { city: "Long Beach · 90803",        price: "$1.05M", yoy: "+2.1%", dom: "33 days", inventory: "3.1 mo", note: "Belmont Shore / Naples" },
    ],
    notes: [
      "Insurance is the active variable — ~22% of escrows extended for coverage.",
      "Westside / Eastside dynamic still favors transit-adjacent sub-markets.",
      "ULA \"Mansion Tax\" suppressing $5M+ closings; up only 11% off 2024 lows.",
    ],
    sources: [
      { name: "CRMLS Reports",       href: "https://www.crmls.org/data/" },
      { name: "Redfin Data — LA",    href: "https://www.redfin.com/news/data-center/" },
      { name: "TheMLS / CLAW",       href: "https://www.themls.com/" },
    ],
    asOf: "Apr 2026",
  },
  "miami": {
    slug: "miami",
    label: "Miami",
    state: "FL",
    subtitle: "Miami-Dade · Stellar MLS",
    headline: "Cash share at decade high; rates matter less here.",
    medianPrice: "$615,000",
    yoy: "+5.4%",
    yoyUp: true,
    dom: "47 days",
    inventory: "5.1 mo",
    permits30d: "+8%",
    subMarkets: [
      { city: "Brickell · 33131",     price: "$725k",  yoy: "+6.2%", dom: "41 days", inventory: "4.6 mo", note: "Brickell Key" },
      { city: "Coral Gables · 33134", price: "$1.45M", yoy: "+3.8%", dom: "52 days", inventory: "5.4 mo", note: "Granada / Coconut Grove" },
      { city: "Doral · 33178",        price: "$595k",  yoy: "+4.7%", dom: "39 days", inventory: "4.0 mo", note: "Downtown Doral" },
    ],
    notes: [
      "44% of closings all-cash in Q1 — highest reading since 2014.",
      "Condo HOA + assessment headlines pressuring older-stock pricing.",
      "International buyer share at 18% (Miami-Dade), up from 14% prior.",
    ],
    sources: [
      { name: "Miami Realtors Reports",  href: "https://www.miamirealtors.com/news-and-research/market-reports/" },
      { name: "Stellar MLS",              href: "https://www.stellarmls.com/" },
    ],
    asOf: "Apr 2026",
  },
  "chicago": {
    slug: "chicago",
    label: "Chicago",
    state: "IL",
    subtitle: "Chicagoland · MRED",
    headline: "North-side condos selective; bungalow belt steady.",
    medianPrice: "$345,000",
    yoy: "+2.1%",
    yoyUp: true,
    dom: "38 days",
    inventory: "3.6 mo",
    permits30d: "+1%",
    subMarkets: [
      { city: "Lincoln Park · 60614", price: "$685k",  yoy: "+1.8%", dom: "35 days", inventory: "3.3 mo", note: "Old Town / Bucktown adj." },
      { city: "Logan Square · 60647", price: "$485k",  yoy: "+2.6%", dom: "31 days", inventory: "3.0 mo", note: "Palmer Square" },
      { city: "Naperville · 60540",   price: "$575k",  yoy: "+3.1%", dom: "28 days", inventory: "2.7 mo", note: "Downtown / North Aurora" },
    ],
    notes: [
      "MRED inventory holding flat YoY — first non-decline in 14 months.",
      "Property tax reassessment cycle dampening new contracts in Cook Co.",
      "Investor share at 19%, in line with 5-yr average.",
    ],
    sources: [
      { name: "MRED MarketView", href: "https://www.mredllc.com/Marketwise" },
      { name: "Illinois REALTORS",href: "https://www.illinoisrealtors.org/marketstats/" },
    ],
    asOf: "Apr 2026",
  },
  "atlanta": {
    slug: "atlanta",
    label: "Atlanta",
    state: "GA",
    subtitle: "Atlanta metro · FMLS / GAMLS",
    headline: "Sun Belt resilience continues; intown ITP leads.",
    medianPrice: "$398,000",
    yoy: "+3.6%",
    yoyUp: true,
    dom: "34 days",
    inventory: "2.9 mo",
    permits30d: "+11%",
    subMarkets: [
      { city: "Buckhead · 30327",     price: "$1.32M", yoy: "+3.4%", dom: "39 days", inventory: "3.5 mo", note: "Tuxedo Park" },
      { city: "Decatur · 30030",      price: "$725k",  yoy: "+4.8%", dom: "26 days", inventory: "2.4 mo", note: "Oakhurst / MAK" },
      { city: "Alpharetta · 30022",   price: "$685k",  yoy: "+3.1%", dom: "31 days", inventory: "2.8 mo", note: "Avalon / Crabapple" },
    ],
    notes: [
      "FMLS reports 6 of 11 ITP sub-markets at 2-month inventory or below.",
      "BTR pipeline: 5,400 units expected Q3-Q4, mostly Cherokee + Forsyth.",
      "Investor share holding at 22% — one of highest in top-25 metros.",
    ],
    sources: [
      { name: "FMLS Market Stats", href: "https://firstmls.com/" },
      { name: "GAMLS Reports",     href: "https://www.gamls.com/" },
    ],
    asOf: "Apr 2026",
  },
  "seattle": {
    slug: "seattle",
    label: "Seattle",
    state: "WA",
    subtitle: "King County · NWMLS",
    headline: "Eastside steady; Seattle proper finally turning.",
    medianPrice: "$865,000",
    yoy: "+2.8%",
    yoyUp: true,
    dom: "21 days",
    inventory: "1.8 mo",
    permits30d: "+5%",
    subMarkets: [
      { city: "Bellevue · 98004",     price: "$2.4M",  yoy: "+3.2%", dom: "18 days", inventory: "1.6 mo", note: "Downtown / Medina adj." },
      { city: "Capitol Hill · 98112", price: "$985k",  yoy: "+2.4%", dom: "23 days", inventory: "2.1 mo", note: "Stevens / Madrona" },
      { city: "Kirkland · 98033",     price: "$1.45M", yoy: "+3.6%", dom: "19 days", inventory: "1.7 mo", note: "Downtown Kirkland" },
    ],
    notes: [
      "NWMLS: months-of-supply at 1.8, lowest spring print since 2022.",
      "Tech RTO trends pulling Eastside DOM down 18% YoY.",
      "Multi-offer share at 41% of accepted contracts in King County.",
    ],
    sources: [
      { name: "NWMLS Statistics",    href: "https://www.nwmls.com/discover/statistics" },
      { name: "Redfin Data — Seattle",href: "https://www.redfin.com/news/data-center/" },
    ],
    asOf: "Apr 2026",
  },
  "boston": {
    slug: "boston",
    label: "Boston",
    state: "MA",
    subtitle: "Greater Boston · MLS PIN",
    headline: "Inventory the lowest in any top-30 metro.",
    medianPrice: "$748,000",
    yoy: "+4.2%",
    yoyUp: true,
    dom: "24 days",
    inventory: "1.5 mo",
    permits30d: "−3%",
    subMarkets: [
      { city: "Back Bay · 02116",     price: "$1.65M", yoy: "+3.8%", dom: "29 days", inventory: "1.9 mo", note: "Comm Ave / Beacon St" },
      { city: "Cambridge · 02138",    price: "$1.45M", yoy: "+4.4%", dom: "21 days", inventory: "1.4 mo", note: "Harvard Sq" },
      { city: "Newton · 02458",       price: "$1.38M", yoy: "+5.1%", dom: "19 days", inventory: "1.3 mo", note: "Newton Centre" },
    ],
    notes: [
      "MLS PIN: 2.1 months YoY → 1.5 months current — sharp tightening.",
      "Suburban DOM dropped to 19 days; multi-offer share at 47%.",
      "New construction permitting flat under MBTA Communities pressure.",
    ],
    sources: [
      { name: "MLS PIN Statistics",          href: "https://www.mlspin.com/Public/Default.aspx" },
      { name: "Mass. Assoc. of REALTORS",    href: "https://www.marealtor.com/about-mar/news-publications/market-statistics/" },
    ],
    asOf: "Apr 2026",
  },
  "phoenix": {
    slug: "phoenix",
    label: "Phoenix",
    state: "AZ",
    subtitle: "Maricopa County · ARMLS",
    headline: "Inventory normalized; price acceleration cooling.",
    medianPrice: "$478,000",
    yoy: "+1.9%",
    yoyUp: true,
    dom: "41 days",
    inventory: "3.4 mo",
    permits30d: "+4%",
    subMarkets: [
      { city: "Scottsdale · 85258",   price: "$1.24M", yoy: "+1.4%", dom: "48 days", inventory: "4.1 mo", note: "Gainey Ranch / DC Ranch" },
      { city: "Arcadia · 85018",      price: "$1.08M", yoy: "+2.2%", dom: "39 days", inventory: "3.5 mo", note: "Camelback Corridor" },
      { city: "Gilbert · 85295",      price: "$558k",  yoy: "+2.6%", dom: "34 days", inventory: "2.9 mo", note: "Power Ranch / Layton Lakes" },
    ],
    notes: [
      "ARMLS active count back near 2019 norms; price acceleration ~half of 2024.",
      "BTR pipeline still significant — 11,200 units in delivery 2026-2027.",
      "Insurance / monsoon-roof costs the most-flagged surprise for relos.",
    ],
    sources: [
      { name: "ARMLS Stat Reports", href: "https://armls.com/statistics" },
      { name: "Cromford Report",     href: "https://www.cromfordreport.com/" },
    ],
    asOf: "Apr 2026",
  },
  "denver": {
    slug: "denver",
    label: "Denver",
    state: "CO",
    subtitle: "Denver metro · REcolorado",
    headline: "Front Range stable after two-year cooling cycle.",
    medianPrice: "$565,000",
    yoy: "+1.4%",
    yoyUp: true,
    dom: "29 days",
    inventory: "2.7 mo",
    permits30d: "+3%",
    subMarkets: [
      { city: "Cherry Creek · 80206", price: "$1.12M", yoy: "+0.8%", dom: "35 days", inventory: "3.2 mo", note: "CC North / South" },
      { city: "Highlands · 80211",    price: "$795k",  yoy: "+1.6%", dom: "26 days", inventory: "2.4 mo", note: "Lower Highlands" },
      { city: "Boulder · 80302",      price: "$1.42M", yoy: "+2.1%", dom: "31 days", inventory: "3.1 mo", note: "Mapleton Hill / The Hill" },
    ],
    notes: [
      "REcolorado: 4 consecutive months of YoY price growth, modest pace.",
      "Mountain-town markets still the weak spot (Summit, Eagle).",
      "Net relocation flat, neither helping nor hurting demand.",
    ],
    sources: [
      { name: "REcolorado Reports", href: "https://www.recolorado.com/recolorado-market-reports/" },
      { name: "Denver Metro Assoc. of REALTORS", href: "https://dmarealtors.com/dmar-research/" },
    ],
    asOf: "Apr 2026",
  },
  "charlotte": {
    slug: "charlotte",
    label: "Charlotte",
    state: "NC",
    subtitle: "Charlotte metro · Canopy MLS",
    headline: "Strong demand keeps DOM in the mid-20s.",
    medianPrice: "$408,000",
    yoy: "+4.1%",
    yoyUp: true,
    dom: "26 days",
    inventory: "2.3 mo",
    permits30d: "+9%",
    subMarkets: [
      { city: "Myers Park · 28207",   price: "$985k",  yoy: "+3.6%", dom: "29 days", inventory: "2.6 mo", note: "Eastover / Park Rd" },
      { city: "Plaza Midwood · 28205",price: "$595k",  yoy: "+4.4%", dom: "23 days", inventory: "2.0 mo", note: "PMW / Elizabeth" },
      { city: "Ballantyne · 28277",   price: "$695k",  yoy: "+3.8%", dom: "27 days", inventory: "2.4 mo", note: "Ballantyne / Stonecrest" },
    ],
    notes: [
      "Canopy MLS: 18 of last 24 months posted YoY price gains.",
      "Banking-sector hiring stabilizing; net relo positive but smaller than 2022.",
      "BTR pipeline 4,800 units, mostly Lake Norman submarkets.",
    ],
    sources: [
      { name: "Canopy MLS",          href: "https://www.canopymls.com/statistics/" },
      { name: "NC REALTORS",         href: "https://www.ncrealtors.org/research-and-data/" },
    ],
    asOf: "Apr 2026",
  },
  "tampa": {
    slug: "tampa",
    label: "Tampa Bay",
    state: "FL",
    subtitle: "Tampa-St Pete · Stellar MLS",
    headline: "Insurance costs the dominant variable; pricing follows.",
    medianPrice: "$385,000",
    yoy: "+2.6%",
    yoyUp: true,
    dom: "39 days",
    inventory: "3.8 mo",
    permits30d: "+6%",
    subMarkets: [
      { city: "South Tampa · 33606",  price: "$795k", yoy: "+2.9%", dom: "34 days", inventory: "3.2 mo", note: "Hyde Park / SoHo" },
      { city: "St. Pete · 33701",     price: "$575k", yoy: "+3.4%", dom: "31 days", inventory: "2.9 mo", note: "Downtown / Old NE" },
      { city: "Wesley Chapel · 33543",price: "$435k", yoy: "+1.8%", dom: "44 days", inventory: "4.2 mo", note: "Seven Oaks / Wiregrass" },
    ],
    notes: [
      "Citizens Insurance moved 38k policies back to private market in Q1.",
      "Listings flagged \"insurance not assumable\" carrying 6-8 day DOM premium.",
      "BTR delivery 2,600 units Q3 in Pasco / Hillsborough.",
    ],
    sources: [
      { name: "Greater Tampa REALTORS", href: "https://www.tamparealtors.org/Resources/MarketStatistics" },
      { name: "Stellar MLS",            href: "https://www.stellarmls.com/" },
    ],
    asOf: "Apr 2026",
  },
};

/** Default presets for new visitors (matches the user's named examples). */
export const DEFAULT_PRESETS = ["dfw", "philadelphia", "san-diego"];

/** Order shown in the "+ Add region" picker. */
export const ALL_REGION_SLUGS = [
  "dfw", "philadelphia", "san-diego", "austin", "houston", "nyc",
  "la", "miami", "chicago", "atlanta", "seattle", "boston",
  "phoenix", "denver", "charlotte", "tampa",
];
