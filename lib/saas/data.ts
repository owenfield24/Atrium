// Mock data for SaaS-flavored modules: Keystone (PM), Transactions, MLS connections, etc.

export type MLSConnection = {
  id: string;
  name: string;
  region: string;
  subscribers: number;
  vendor: "Bridge" | "Trestle" | "Direct";
  status: "Live" | "Pending" | "Provisioning" | "Action Needed";
  brokers: number;
  lastSync: string;
};

export const mlsConnections: MLSConnection[] = [
  { id: "ntreis",   name: "NTREIS",       region: "DFW Metroplex",      subscribers: 40000,  vendor: "Bridge",  status: "Live",          brokers: 7, lastSync: "2026-04-25T14:22:00Z" },
  { id: "har",      name: "HAR",          region: "Houston metro",      subscribers: 50000,  vendor: "Bridge",  status: "Live",          brokers: 3, lastSync: "2026-04-25T14:18:00Z" },
  { id: "abor",     name: "Austin Board", region: "Austin metro",       subscribers: 17000,  vendor: "Bridge",  status: "Provisioning",  brokers: 1, lastSync: "—" },
  { id: "sabor",    name: "SABOR",        region: "San Antonio metro",  subscribers: 13000,  vendor: "Trestle", status: "Pending",       brokers: 1, lastSync: "—" },
  { id: "bright",   name: "Bright MLS",   region: "DC/MD/VA/DE/NJ/PA/WV",subscribers: 109000, vendor: "Bridge",  status: "Action Needed", brokers: 2, lastSync: "2026-04-23T09:11:00Z" },
  { id: "crmls",    name: "CRMLS",        region: "California",         subscribers: 110000, vendor: "Direct",  status: "Live",          brokers: 4, lastSync: "2026-04-25T13:55:00Z" },
  { id: "stellar",  name: "Stellar MLS",  region: "Florida",            subscribers: 75000,  vendor: "Bridge",  status: "Live",          brokers: 2, lastSync: "2026-04-25T13:40:00Z" },
];

export type Transaction = {
  id: string;
  address: string;
  side: "Buyer" | "Seller";
  client: string;
  agent: string;
  stage: "Lead" | "Active Search" | "Offer" | "Under Contract" | "Closing" | "Closed";
  price: number;
  closeDate: string | null;
  daysInStage: number;
  pctDone: number;
  flags: string[]; // e.g. ["Buyer-Broker Signed"]
};

export const transactions: Transaction[] = [
  { id: "TX-101", address: "4821 Westbrook Lane",     side: "Buyer",  client: "Jennifer Walsh",  agent: "Tyrone Mitchell", stage: "Active Search",   price: 875000,  closeDate: null,         daysInStage: 6,  pctDone: 25, flags: ["Buyer-Broker Signed", "Pre-approved"] },
  { id: "TX-102", address: "1103 Ridgecrest Drive",   side: "Seller", client: "Daniels Family",   agent: "James Okafor",    stage: "Under Contract",  price: 1250000, closeDate: "2026-05-12", daysInStage: 4,  pctDone: 65, flags: ["Inspection Done"] },
  { id: "TX-103", address: "512 East 6th Street #4B", side: "Buyer",  client: "Marcus Chen",      agent: "Tyrone Mitchell", stage: "Offer",           price: 445000,  closeDate: "2026-05-30", daysInStage: 2,  pctDone: 40, flags: ["Buyer-Broker Signed"] },
  { id: "TX-104", address: "2400 Travis Heights Blvd", side: "Seller", client: "Robinson",        agent: "Maya Patel",      stage: "Closing",         price: 695000,  closeDate: "2026-04-29", daysInStage: 1,  pctDone: 90, flags: ["Final Walkthrough"] },
  { id: "TX-105", address: "8765 Lakeview Terrace",   side: "Buyer",  client: "Sofia Reyes",      agent: "Tyrone Mitchell", stage: "Lead",            price: 0,       closeDate: null,         daysInStage: 12, pctDone: 5,  flags: ["No Buyer-Broker Yet"] },
  { id: "TX-106", address: "316 Pemberton Heights",   side: "Buyer",  client: "Theo Nakamura",    agent: "James Okafor",    stage: "Closed",          price: 980000,  closeDate: "2026-04-08", daysInStage: 0,  pctDone: 100, flags: [] },
];

// Keystone — building → unit → tenant
export type Building = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  units: number;
  ownerEntity: string;
  insurer: string;
  insuranceExpiresOn: string;
  hoaFee: number;
  marketValue: number;
  monthlyRent: number;
};

export type Unit = {
  id: string;
  buildingId: string;
  label: string;        // "Unit A", "1F-2"
  beds: number;
  baths: number;
  sqft: number;
  status: "Occupied" | "Vacant" | "Notice Given" | "Mid-Turnover";
  rent: number;
  leaseEndsOn: string | null;
  tenantId: string | null;
};

export type Tenant = {
  id: string;
  unitId: string;
  name: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  deposit: number;
  paymentStatus: "Current" | "Late 1-7d" | "Late 8-30d" | "Delinquent";
  rentersInsurance: "Verified" | "Expired" | "Missing";
  cotenant?: string;
};

export type MaintenanceTicket = {
  id: string;
  unitId: string;
  title: string;
  priority: "Low" | "Med" | "High" | "Emergency";
  status: "Open" | "Scheduled" | "In Progress" | "Resolved";
  vendor: string | null;
  openedOn: string;
};

export const buildings: Building[] = [
  { id: "B-100", name: "Magnolia Court Duplex",  address: "1212 Magnolia Ave",     city: "Fort Worth", state: "TX", units: 2,  ownerEntity: "Walsh Holdings LLC",      insurer: "State Farm",   insuranceExpiresOn: "2026-09-01", hoaFee: 0,    marketValue: 720000,  monthlyRent: 4200 },
  { id: "B-101", name: "Crestwood Triplex",      address: "3408 W 6th St",         city: "Fort Worth", state: "TX", units: 3,  ownerEntity: "Walsh Holdings LLC",      insurer: "State Farm",   insuranceExpiresOn: "2026-09-01", hoaFee: 0,    marketValue: 1100000, monthlyRent: 6900 },
  { id: "B-102", name: "Tanglewood Condo 4B",    address: "2540 W 7th St #4B",     city: "Fort Worth", state: "TX", units: 1,  ownerEntity: "Sofia Reyes (personal)",  insurer: "Lemonade",     insuranceExpiresOn: "2026-12-15", hoaFee: 425,  marketValue: 485000,  monthlyRent: 2650 },
  { id: "B-103", name: "Bishop Arts SFR",        address: "418 N Tyler St",        city: "Dallas",     state: "TX", units: 1,  ownerEntity: "Reyes Capital LLC",       insurer: "Travelers",    insuranceExpiresOn: "2026-07-22", hoaFee: 0,    marketValue: 615000,  monthlyRent: 3100 },
  { id: "B-104", name: "Westover Hills Cottage", address: "8901 Boat Club Rd",     city: "Fort Worth", state: "TX", units: 1,  ownerEntity: "Daniels Trust",           insurer: "USAA",         insuranceExpiresOn: "2026-06-30", hoaFee: 0,    marketValue: 540000,  monthlyRent: 2950 },
  { id: "B-105", name: "Heights 4-Plex",         address: "1801 Hardy St",         city: "Houston",    state: "TX", units: 4,  ownerEntity: "Walsh Holdings LLC",      insurer: "Travelers",    insuranceExpiresOn: "2026-11-04", hoaFee: 0,    marketValue: 1250000, monthlyRent: 7800 },
];

export const units: Unit[] = [
  { id: "U-100A", buildingId: "B-100", label: "Unit A",    beds: 2, baths: 1.5, sqft: 1100, status: "Occupied",     rent: 2150, leaseEndsOn: "2026-08-31", tenantId: "T-001" },
  { id: "U-100B", buildingId: "B-100", label: "Unit B",    beds: 2, baths: 1.5, sqft: 1100, status: "Notice Given", rent: 2050, leaseEndsOn: "2026-05-31", tenantId: "T-002" },
  { id: "U-101A", buildingId: "B-101", label: "Front",     beds: 3, baths: 2,   sqft: 1450, status: "Occupied",     rent: 2600, leaseEndsOn: "2027-02-28", tenantId: "T-003" },
  { id: "U-101B", buildingId: "B-101", label: "Back-1F",   beds: 1, baths: 1,   sqft: 720,  status: "Occupied",     rent: 1750, leaseEndsOn: "2026-10-15", tenantId: "T-004" },
  { id: "U-101C", buildingId: "B-101", label: "Back-2F",   beds: 2, baths: 1,   sqft: 920,  status: "Vacant",       rent: 2100, leaseEndsOn: null,         tenantId: null    },
  { id: "U-102",  buildingId: "B-102", label: "Whole",     beds: 2, baths: 2,   sqft: 1180, status: "Occupied",     rent: 2650, leaseEndsOn: "2026-12-31", tenantId: "T-005" },
  { id: "U-103",  buildingId: "B-103", label: "Whole",     beds: 3, baths: 2,   sqft: 1640, status: "Occupied",     rent: 3100, leaseEndsOn: "2027-01-15", tenantId: "T-006" },
  { id: "U-104",  buildingId: "B-104", label: "Whole",     beds: 3, baths: 2,   sqft: 1820, status: "Mid-Turnover", rent: 2950, leaseEndsOn: null,         tenantId: null    },
  { id: "U-105A", buildingId: "B-105", label: "1",         beds: 2, baths: 1,   sqft: 950,  status: "Occupied",     rent: 1900, leaseEndsOn: "2026-07-31", tenantId: "T-007" },
  { id: "U-105B", buildingId: "B-105", label: "2",         beds: 2, baths: 1,   sqft: 950,  status: "Occupied",     rent: 1900, leaseEndsOn: "2026-09-30", tenantId: "T-008" },
  { id: "U-105C", buildingId: "B-105", label: "3",         beds: 2, baths: 1,   sqft: 950,  status: "Occupied",     rent: 1950, leaseEndsOn: "2027-03-15", tenantId: "T-009" },
  { id: "U-105D", buildingId: "B-105", label: "4",         beds: 2, baths: 1,   sqft: 950,  status: "Vacant",       rent: 2050, leaseEndsOn: null,         tenantId: null    },
];

export const tenants: Tenant[] = [
  { id: "T-001", unitId: "U-100A", name: "Marcus Chen",       email: "marcus.c@example.com",   phone: "817-555-0143", leaseStart: "2025-09-01", leaseEnd: "2026-08-31", rent: 2150, deposit: 2150, paymentStatus: "Current",   rentersInsurance: "Verified", cotenant: "Lin Chen" },
  { id: "T-002", unitId: "U-100B", name: "Theo Nakamura",     email: "theo.n@example.com",     phone: "817-555-0188", leaseStart: "2024-06-01", leaseEnd: "2026-05-31", rent: 2050, deposit: 2050, paymentStatus: "Current",   rentersInsurance: "Expired"   },
  { id: "T-003", unitId: "U-101A", name: "Aisha Bennett",     email: "aisha.b@example.com",    phone: "817-555-0211", leaseStart: "2025-03-01", leaseEnd: "2027-02-28", rent: 2600, deposit: 2600, paymentStatus: "Late 1-7d", rentersInsurance: "Verified" },
  { id: "T-004", unitId: "U-101B", name: "Devin Wilson",      email: "devin.w@example.com",    phone: "817-555-0307", leaseStart: "2024-10-15", leaseEnd: "2026-10-15", rent: 1750, deposit: 1750, paymentStatus: "Current",   rentersInsurance: "Verified" },
  { id: "T-005", unitId: "U-102",  name: "Sofia Reyes",       email: "sofia.r@example.com",    phone: "817-555-0492", leaseStart: "2025-01-01", leaseEnd: "2026-12-31", rent: 2650, deposit: 2650, paymentStatus: "Current",   rentersInsurance: "Verified" },
  { id: "T-006", unitId: "U-103",  name: "Bryce Patterson",   email: "bryce.p@example.com",    phone: "214-555-0119", leaseStart: "2025-01-15", leaseEnd: "2027-01-15", rent: 3100, deposit: 3100, paymentStatus: "Current",   rentersInsurance: "Verified" },
  { id: "T-007", unitId: "U-105A", name: "Yuki Tanaka",       email: "yuki.t@example.com",     phone: "713-555-0228", leaseStart: "2024-08-01", leaseEnd: "2026-07-31", rent: 1900, deposit: 1900, paymentStatus: "Late 8-30d",rentersInsurance: "Missing"   },
  { id: "T-008", unitId: "U-105B", name: "Henry Goldsmith",   email: "henry.g@example.com",    phone: "713-555-0341", leaseStart: "2024-10-01", leaseEnd: "2026-09-30", rent: 1900, deposit: 1900, paymentStatus: "Current",   rentersInsurance: "Verified" },
  { id: "T-009", unitId: "U-105C", name: "Camila Ruiz",       email: "camila.r@example.com",   phone: "713-555-0455", leaseStart: "2025-03-15", leaseEnd: "2027-03-15", rent: 1950, deposit: 1950, paymentStatus: "Current",   rentersInsurance: "Verified", cotenant: "Mateo Ruiz" },
];

export const maintenanceTickets: MaintenanceTicket[] = [
  { id: "M-201", unitId: "U-101A", title: "HVAC blowing warm air",          priority: "High",      status: "Scheduled",   vendor: "Texas Cool HVAC",      openedOn: "2026-04-23T10:11:00Z" },
  { id: "M-202", unitId: "U-100B", title: "Garbage disposal jammed",        priority: "Med",       status: "Open",        vendor: null,                    openedOn: "2026-04-24T18:42:00Z" },
  { id: "M-203", unitId: "U-105A", title: "Water leak under kitchen sink",  priority: "Emergency", status: "In Progress", vendor: "Goldstar Plumbing",     openedOn: "2026-04-24T22:17:00Z" },
  { id: "M-204", unitId: "U-103",  title: "Front door deadbolt loose",      priority: "Low",       status: "Resolved",    vendor: "Self-handled",          openedOn: "2026-04-21T14:00:00Z" },
  { id: "M-205", unitId: "U-104",  title: "Full turnover paint + carpet",   priority: "Med",       status: "Scheduled",   vendor: "Atrium Originals (PM)", openedOn: "2026-04-22T09:00:00Z" },
];

// Team / agents
export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: "Owner / DB" | "Agent" | "Transaction Coord" | "Marketing" | "Admin";
  seat: "Skylight" | "Courtyard" | "Atrium" | "Foundation";
  ytdGCI: number;
  ytdTransactions: number;
  capProgress: number; // 0..1
  status: "Active" | "Onboarding" | "Inactive";
};

export const team: TeamMember[] = [
  { id: "A-1", name: "Tyrone Mitchell",  initials: "TM", role: "Owner / DB",        seat: "Atrium",     ytdGCI: 184500, ytdTransactions: 11, capProgress: 0.92, status: "Active" },
  { id: "A-2", name: "James Okafor",    initials: "JO", role: "Agent",             seat: "Courtyard",  ytdGCI: 121300, ytdTransactions: 8,  capProgress: 0.74, status: "Active" },
  { id: "A-3", name: "Maya Patel",      initials: "MP", role: "Agent",             seat: "Courtyard",  ytdGCI: 88600,  ytdTransactions: 6,  capProgress: 0.55, status: "Active" },
  { id: "A-4", name: "Ren Castillo",    initials: "RC", role: "Agent",             seat: "Skylight",   ytdGCI: 22400,  ytdTransactions: 2,  capProgress: 0.14, status: "Onboarding" },
  { id: "A-5", name: "Priya Shah",      initials: "PS", role: "Transaction Coord", seat: "Skylight",   ytdGCI: 0,      ytdTransactions: 0,  capProgress: 0,    status: "Active" },
  { id: "A-6", name: "Mateo Alvarez",   initials: "MA", role: "Marketing",         seat: "Skylight",   ytdGCI: 0,      ytdTransactions: 0,  capProgress: 0,    status: "Active" },
];

// IDX / Compliance audit log
export type AuditEvent = {
  id: string;
  ts: string;
  actor: string;
  kind: "view" | "search" | "share" | "rule" | "export";
  message: string;
  mls: string;
};

export const auditEvents: AuditEvent[] = [
  { id: "E-9001", ts: "2026-04-25T14:22:00Z", actor: "consumer:abc-918", kind: "view",   message: "Listing detail viewed: 4821 Westbrook Lane",            mls: "NTREIS"  },
  { id: "E-9000", ts: "2026-04-25T14:18:00Z", actor: "Tyrone Mitchell",   kind: "share",  message: "Shortlist sent to Jennifer Walsh — 5 listings",         mls: "NTREIS"  },
  { id: "E-8999", ts: "2026-04-25T13:55:00Z", actor: "consumer:abc-918", kind: "search", message: "Search: 4bd / Westlake / $750k–$950k",                  mls: "NTREIS"  },
  { id: "E-8998", ts: "2026-04-25T11:02:00Z", actor: "system",           kind: "rule",   message: "Filtered 14 listings flagged Internet-Display=No",      mls: "NTREIS"  },
  { id: "E-8997", ts: "2026-04-25T10:41:00Z", actor: "system",           kind: "rule",   message: "Suppressed Office-Exclusive Exempt listing",            mls: "Bright"  },
  { id: "E-8996", ts: "2026-04-25T09:15:00Z", actor: "James Okafor",     kind: "export", message: "Exported audit log Q1-2026.csv (consumer activity)",    mls: "ALL"     },
  { id: "E-8995", ts: "2026-04-25T08:00:00Z", actor: "system",           kind: "rule",   message: "Refreshed MLS attribution + disclaimer for NTREIS",      mls: "NTREIS"  },
  { id: "E-8994", ts: "2026-04-24T19:48:00Z", actor: "consumer:def-220", kind: "view",   message: "Listing detail viewed: 1103 Ridgecrest Drive",          mls: "NTREIS"  },
];

// State / city compliance flags for Keystone
export type RegionRule = {
  region: string;
  scope: "State" | "City";
  rules: string[];
};

export const regionRules: RegionRule[] = [
  { region: "Texas",        scope: "State", rules: ["Security deposit must be returned in 30 days", "Late fee max: 12% of rent (or reasonable)", "Notice to vacate: 3 days for non-payment"] },
  { region: "California",   scope: "State", rules: ["Deposit cap: 1× rent unfurnished, 2× furnished", "Just-cause eviction (AB 1482) statewide", "Annual rent cap CPI+5% / 10% max"] },
  { region: "New York City",scope: "City",  rules: ["Rent stabilization on pre-1974 6+ unit buildings", "Notice 30/60/90 days based on tenancy length", "Security deposit cap: 1× rent"] },
  { region: "Portland, OR", scope: "City",  rules: ["No-cause eviction prohibited", "Relocation assistance ($2,900–$4,500) for landlord-cause moves", "Screening criteria disclosure required"] },
  { region: "St. Paul, MN", scope: "City",  rules: ["Just-cause eviction", "Rent control: 3% annual cap (with exceptions)", "Notice of sale required"] },
];

// Featured pricing tiers (from Plan Summary)
export const pricingTiers = [
  {
    id: "skylight",
    name: "Skylight",
    blurb: "Solo agent, 1 seat",
    price: 49,
    unit: "/mo",
    features: [
      "Lead capture + basic CRM",
      "Transaction checklist",
      "Branded property pages",
      "1 listing/month media credit",
      "MLS data via your IDX feed",
    ],
    cta: "Start Skylight",
  },
  {
    id: "courtyard",
    name: "Courtyard",
    blurb: "Small team, up to 5 seats",
    price: 179,
    unit: "/mo",
    features: [
      "Everything in Skylight",
      "Shared pipeline + lead routing",
      "Team analytics",
      "MLS / DocuSign / Dotloop",
      "Basic reporting",
    ],
    cta: "Start Courtyard",
    highlight: true,
  },
  {
    id: "keystone",
    name: "Keystone",
    blurb: "Landlords & PMs, 1–50 units",
    price: 129,
    unit: "/mo + $3/unit",
    features: [
      "Building → Unit → Tenant model",
      "Lease tracking + rent roll",
      "Maintenance tickets + vendor directory",
      "Tenant screening (TransUnion / RentPrep)",
      "Renters' insurance verification",
    ],
    cta: "Start Keystone",
  },
  {
    id: "atrium",
    name: "Atrium",
    blurb: "Small brokerage, 6–25 seats",
    price: 499,
    unit: "/mo + $29/seat",
    features: [
      "Everything in Courtyard",
      "Back-office + compliance vault",
      "Agent split + cap tracking",
      "White-label client portals",
      "Recruiting CRM",
      "Audit-ready file organization",
    ],
    cta: "Talk to Sales",
  },
  {
    id: "foundation",
    name: "Foundation",
    blurb: "Multi-office, 25+ seats",
    price: 1500,
    unit: "/mo (custom)",
    features: [
      "Everything in Atrium",
      "API access + SSO",
      "Custom integrations",
      "White-glove onboarding",
      "Dedicated success manager",
    ],
    cta: "Talk to Sales",
  },
];

export type SourceROI = {
  source: string;
  spend: number;
  leads: number;
  closed: number;
  gci: number;
};

export const sourceROI: SourceROI[] = [
  { source: "Past clients (referral)", spend: 1200,  leads: 18, closed: 7, gci: 96400 },
  { source: "Sphere of influence",     spend: 800,   leads: 11, closed: 4, gci: 51200 },
  { source: "Atrium Brief newsletter", spend: 0,     leads: 22, closed: 3, gci: 38600 },
  { source: "Zillow Premier",          spend: 4400,  leads: 26, closed: 2, gci: 28000 },
  { source: "Open houses",             spend: 600,   leads: 14, closed: 2, gci: 21000 },
  { source: "LinkedIn / founder-led",  spend: 200,   leads: 9,  closed: 1, gci: 14500 },
];

export type Insight = {
  zip: string;
  city: string;
  medianPrice: number;
  yoyPct: number;
  inventoryMonths: number;
  daysOnMarket: number;
  permitsLast30: number;
  btrPipeline: number;
};

export const insights: Insight[] = [
  { zip: "76107", city: "Fort Worth — Crestwood/W7th", medianPrice: 612000,  yoyPct:  4.8, inventoryMonths: 2.1, daysOnMarket: 22, permitsLast30: 14, btrPipeline: 2  },
  { zip: "76109", city: "Fort Worth — Tanglewood",     medianPrice: 925000,  yoyPct:  6.2, inventoryMonths: 1.8, daysOnMarket: 17, permitsLast30: 21, btrPipeline: 3  },
  { zip: "76104", city: "Fort Worth — Fairmount",      medianPrice: 415000,  yoyPct:  3.1, inventoryMonths: 2.7, daysOnMarket: 28, permitsLast30: 9,  btrPipeline: 1  },
  { zip: "78731", city: "Austin — NW Hills",           medianPrice: 1085000, yoyPct: -1.4, inventoryMonths: 3.6, daysOnMarket: 41, permitsLast30: 6,  btrPipeline: 0  },
  { zip: "78746", city: "Austin — Westlake",           medianPrice: 1850000, yoyPct: -2.1, inventoryMonths: 4.2, daysOnMarket: 55, permitsLast30: 4,  btrPipeline: 0  },
  { zip: "75208", city: "Dallas — Bishop Arts",        medianPrice: 685000,  yoyPct:  5.4, inventoryMonths: 2.0, daysOnMarket: 19, permitsLast30: 18, btrPipeline: 4  },
];
