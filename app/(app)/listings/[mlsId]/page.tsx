"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { mlsListings } from "@/lib/mls/data";
import { fmt } from "@/lib/utils";

export default function ListingDetailPage() {
  const params = useParams<{ mlsId: string }>();
  const listing = mlsListings.find((l) => l.mlsId === params.mlsId);

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto pt-16 pb-24">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Listings</p>
        <h1 className="mt-3 text-3xl font-semibold tighter">Listing not found.</h1>
        <Link href="/listings" className="mt-6 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const offMarket = listing.status === "Closed" || listing.status === "Expired";
  const priceCut  = listing.originalListPrice && listing.originalListPrice > listing.listPrice;

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-24">
      <div className="flex items-center justify-between gap-4">
        <Link href="/listings" className="text-sm font-medium text-mute hover:text-ink">
          ← All listings
        </Link>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-mute">
          <span>{listing.mlsId}</span>
          <span className="text-mute/40">·</span>
          <span>{listing.daysOnMarket}d on market</span>
        </div>
      </div>

      {/* HERO IMAGE + STATUS */}
      <div className="mt-6 relative rounded-3xl overflow-hidden border border-line bg-soft aspect-[16/9]">
        {listing.photos?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt={listing.address} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white bg-ink/80 backdrop-blur px-3 py-1 rounded-full">
            {listing.status}
          </span>
          {priceCut && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Price cut
            </span>
          )}
        </div>
      </div>

      {/* HEADLINE */}
      <header className="mt-8 grid lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tighter leading-[1.05]">{listing.address}</h1>
          <p className="mt-3 text-base text-mute">{listing.city}, {listing.state} {listing.zip}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl md:text-5xl font-mono font-semibold tighter text-ink">{fmt(listing.listPrice)}</p>
          {priceCut && (
            <p className="mt-1 text-sm text-amber-700 line-through font-mono">{fmt(listing.originalListPrice)}</p>
          )}
          <p className="mt-1 text-xs text-mute font-mono">${listing.pricePerSqft}/sf</p>
        </div>
      </header>

      {/* PILLARS */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Pillar label="Bedrooms"      value={String(listing.bedrooms)} />
        <Pillar label="Bathrooms"     value={String(listing.bathrooms)} />
        <Pillar label="Sqft"          value={listing.sqft.toLocaleString()} />
        <Pillar label="Lot"           value={`${listing.lotSize} ac`} />
        <Pillar label="Garage"        value={`${listing.garageSpaces}-car`} />
        <Pillar label="Year built"    value={String(listing.yearBuilt)} />
      </div>

      {/* DESCRIPTION + FEATURES */}
      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <Section eyebrow="Description">
            <p className="text-base text-ink leading-relaxed">{listing.description}</p>
          </Section>

          {listing.features?.length > 0 && (
            <Section eyebrow="Features">
              <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-6">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink">
                    <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section eyebrow="Cost details">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
              <Term label="HOA fee"      value={listing.hoaFee ? `${fmt(listing.hoaFee)}/mo` : "None"} />
              <Term label="Annual taxes" value={fmt(listing.taxAnnual)} />
              <Term label="Property type" value={listing.propertyType} />
              <Term label="List date"     value={new Date(listing.listDate).toLocaleDateString()} />
              {listing.openHouseDate && <Term label="Next open house" value={new Date(listing.openHouseDate).toLocaleDateString()} />}
              {offMarket && listing.closedDate && <Term label="Closed" value={new Date(listing.closedDate).toLocaleDateString()} />}
              {offMarket && listing.closedPrice && <Term label="Closed at" value={fmt(listing.closedPrice)} mono />}
            </dl>
          </Section>
        </div>

        {/* LISTING AGENT — IDX-compliant attribution */}
        <aside className="lg:sticky lg:top-10 self-start">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Listed by</p>
            <p className="mt-2 text-base font-semibold text-ink">{listing.agentName}</p>
            <p className="text-xs text-mute">{listing.brokerageName}</p>
            <button className="mt-4 w-full bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-mute">
              Request a showing
            </button>
            <button className="mt-2 w-full text-sm font-medium text-ink border border-line hover:border-ink/40 px-5 py-2.5 rounded-full">
              Send to a client
            </button>
          </div>
          <p className="mt-3 text-[10px] text-mute font-mono leading-relaxed">
            MLS data deemed reliable but not guaranteed. © NTREIS.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-6 mt-6 first:border-t-0 first:mt-0 first:pt-0">
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700 mb-3">{eyebrow}</p>
      {children}
    </section>
  );
}

function Pillar({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-soft/60 border border-line/60 px-4 py-3 text-center">
      <p className="text-xl font-mono font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-mute">{label}</p>
    </div>
  );
}

function Term({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-mute">{label}</dt>
      <dd className={`mt-0.5 text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
