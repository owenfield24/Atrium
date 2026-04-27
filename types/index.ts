export type ListingStatus = "Active" | "Pending" | "Closed" | "Expired" | "Coming Soon";
export type PropertyType = "Single Family" | "Condo" | "Townhouse" | "Multi-Family" | "Land" | "Commercial";
export type ClientStatus = "Active Buyer" | "Active Seller" | "Closed" | "Lead" | "Nurture";

export interface MLSListing {
  mlsId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice: number;
  originalListPrice: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  garageSpaces: number;
  yearBuilt: number;
  lotSize: number;
  propertyType: PropertyType;
  status: ListingStatus;
  daysOnMarket: number;
  listDate: string;
  closedDate: string | null;
  closedPrice: number | null;
  description: string;
  features: string[];
  photos: string[];
  agentName: string;
  agentId: string;
  brokerageName: string;
  latitude: number;
  longitude: number;
  hoaFee: number | null;
  taxAnnual: number;
  pricePerSqft: number;
  openHouseDate: string | null;
}

export interface ClientPreferences {
  maxBudget: number;
  minBedrooms: number;
  minBathrooms: number;
  preferredTypes: PropertyType[];
  preferredCities: string[];
  preferredZips: string[];
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  type: "Buyer" | "Seller" | "Both";
  budget: number | null;
  preApproved: boolean;
  assignedListings: string[];
  notes: string;
  lastContact: string;
  createdAt: string;
  source: string;
  preferences?: ClientPreferences;

  // — Extended profile fields (all optional, drawer-editable) —
  // Communication
  preferredContact?: "Email" | "Phone" | "Text" | "In-person";
  bestTimeToContact?: string;
  lastContactMethod?: "Email" | "Phone" | "Text" | "In-person";
  nextFollowUp?: string;        // ISO date

  // Buying details (used when type is Buyer or Both)
  budgetMin?: number;
  budgetMax?: number;
  moveInTimeline?: string;      // "0-3 months", "Just looking", etc.
  motivation?: string;          // why they're moving
  schoolDistricts?: string[];

  // Pre-approval
  preApprovalLender?: string;
  preApprovalAmount?: number;
  preApprovalExpires?: string;  // ISO date

  // Selling details (used when type is Seller or Both)
  sellingAddress?: string;
  sellingTargetPrice?: number;
  sellingMotivation?: string;
  sellingTimeline?: string;

  // Family / relationship
  spouseName?: string;
  children?: { name: string; age?: number }[];
  occupation?: string;
  employer?: string;
  referredBy?: string;

  // Important dates
  birthday?: string;            // YYYY-MM-DD
  anniversary?: string;
  contractDate?: string;

  // Free-form organization
  tags?: string[];
}

export interface MatchScore {
  mlsId: string;
  total: number;
  breakdown: {
    budget: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: number;
    location: number;
    features: number;
  };
}

export interface Note {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  relatedClientId?: string;
  relatedMlsId?: string;
  tag: "showing" | "offer" | "financing" | "general" | "price" | "closing";
}

export interface DashboardStats {
  activeListings: number;
  pendingListings: number;
  closedThisMonth: number;
  totalVolumeThisMonth: number;
  avgDaysOnMarket: number;
  avgListPrice: number;
  newLeadsThisWeek: number;
  activeClients: number;
}
