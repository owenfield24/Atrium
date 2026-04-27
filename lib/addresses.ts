/** Mock address autocomplete catalog. Replace with a real Geocoding/Places
 *  API later — the call signature of `searchAddresses` is intentionally
 *  shaped to match what those providers return so the UI doesn't change. */

export interface AddressSuggestion {
  full: string;     // single-line "1234 Main St, Austin, TX 78701"
  street: string;
  city: string;
  state: string;    // 2-letter
  zip: string;
}

const SAMPLE: AddressSuggestion[] = [
  // Austin
  { full: "2300 Westlake Dr, Ste 400, Austin, TX 78746", street: "2300 Westlake Dr, Ste 400", city: "Austin", state: "TX", zip: "78746" },
  { full: "4821 Westbrook Ln, Austin, TX 78731",         street: "4821 Westbrook Ln",         city: "Austin", state: "TX", zip: "78731" },
  { full: "1103 Ridgecrest Dr, Austin, TX 78746",         street: "1103 Ridgecrest Dr",         city: "Austin", state: "TX", zip: "78746" },
  { full: "512 East 6th St, Austin, TX 78701",            street: "512 East 6th St",            city: "Austin", state: "TX", zip: "78701" },
  { full: "8765 Lakeview Terrace, Austin, TX 78759",      street: "8765 Lakeview Terrace",      city: "Austin", state: "TX", zip: "78759" },
  // Dallas / Fort Worth
  { full: "3408 W 7th St, Fort Worth, TX 76107",          street: "3408 W 7th St",              city: "Fort Worth", state: "TX", zip: "76107" },
  { full: "1801 N Lamar St, Dallas, TX 75202",            street: "1801 N Lamar St",            city: "Dallas",     state: "TX", zip: "75202" },
  { full: "4225 Beverly Dr, Highland Park, TX 75205",     street: "4225 Beverly Dr",            city: "Highland Park", state: "TX", zip: "75205" },
  { full: "770 Crestwood Dr, Fort Worth, TX 76107",       street: "770 Crestwood Dr",           city: "Fort Worth", state: "TX", zip: "76107" },
  // Houston
  { full: "2727 Kirby Dr, Houston, TX 77098",             street: "2727 Kirby Dr",              city: "Houston", state: "TX", zip: "77098" },
  { full: "5555 Memorial Dr, Houston, TX 77007",          street: "5555 Memorial Dr",           city: "Houston", state: "TX", zip: "77007" },
  // NYC
  { full: "350 5th Ave, New York, NY 10118",              street: "350 5th Ave",                city: "New York",   state: "NY", zip: "10118" },
  { full: "200 Park Ave, New York, NY 10166",             street: "200 Park Ave",               city: "New York",   state: "NY", zip: "10166" },
  { full: "55 Hudson Yards, New York, NY 10001",          street: "55 Hudson Yards",            city: "New York",   state: "NY", zip: "10001" },
  // LA
  { full: "9560 Wilshire Blvd, Beverly Hills, CA 90212",  street: "9560 Wilshire Blvd",         city: "Beverly Hills", state: "CA", zip: "90212" },
  { full: "1200 Getty Center Dr, Los Angeles, CA 90049",  street: "1200 Getty Center Dr",       city: "Los Angeles",   state: "CA", zip: "90049" },
  { full: "2425 Olympic Blvd, Santa Monica, CA 90404",    street: "2425 Olympic Blvd",          city: "Santa Monica",  state: "CA", zip: "90404" },
  // Miami / Tampa
  { full: "1450 Brickell Ave, Miami, FL 33131",           street: "1450 Brickell Ave",          city: "Miami", state: "FL", zip: "33131" },
  { full: "401 E Jackson St, Tampa, FL 33602",            street: "401 E Jackson St",           city: "Tampa", state: "FL", zip: "33602" },
  // Chicago
  { full: "875 N Michigan Ave, Chicago, IL 60611",        street: "875 N Michigan Ave",         city: "Chicago", state: "IL", zip: "60611" },
  { full: "233 S Wacker Dr, Chicago, IL 60606",           street: "233 S Wacker Dr",            city: "Chicago", state: "IL", zip: "60606" },
  // Seattle
  { full: "1201 3rd Ave, Seattle, WA 98101",              street: "1201 3rd Ave",               city: "Seattle", state: "WA", zip: "98101" },
  { full: "2200 1st Ave S, Seattle, WA 98134",            street: "2200 1st Ave S",             city: "Seattle", state: "WA", zip: "98134" },
  // Denver
  { full: "1700 Lincoln St, Denver, CO 80203",            street: "1700 Lincoln St",            city: "Denver", state: "CO", zip: "80203" },
  // Boston
  { full: "100 Federal St, Boston, MA 02110",             street: "100 Federal St",             city: "Boston", state: "MA", zip: "02110" },
  // Phoenix
  { full: "2575 E Camelback Rd, Phoenix, AZ 85016",       street: "2575 E Camelback Rd",        city: "Phoenix", state: "AZ", zip: "85016" },
  // Atlanta
  { full: "3344 Peachtree Rd NE, Atlanta, GA 30326",      street: "3344 Peachtree Rd NE",       city: "Atlanta", state: "GA", zip: "30326" },
  // Charlotte
  { full: "201 S Tryon St, Charlotte, NC 28202",          street: "201 S Tryon St",             city: "Charlotte", state: "NC", zip: "28202" },
  // San Diego
  { full: "1788 Kettner Blvd, San Diego, CA 92101",       street: "1788 Kettner Blvd",          city: "San Diego", state: "CA", zip: "92101" },
  // Philadelphia
  { full: "1735 Market St, Philadelphia, PA 19103",       street: "1735 Market St",             city: "Philadelphia", state: "PA", zip: "19103" },
];

export function searchAddresses(query: string, limit = 6): AddressSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return SAMPLE.filter((a) => a.full.toLowerCase().includes(q)).slice(0, limit);
}
