import { searchListings } from "@/server/services/listingSearch";
import { ListingCard } from "@/components/ListingCard";
import type { ListingType } from "@prisma/client";

const TYPE_OPTIONS: { value: ListingType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "ACCOMMODATION", label: "Stays" },
  { value: "EXPERIENCE", label: "Experiences" },
  { value: "TOUR_PACKAGE", label: "Tour packages" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { destination?: string; type?: string; q?: string };
}) {
  const type = (searchParams.type as ListingType | undefined) || undefined;

  const listings = await searchListings({
    destinationSlugOrName: searchParams.destination,
    type,
    query: searchParams.q,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink dark:text-nightInk">
        {searchParams.destination ? `Results for "${searchParams.destination}"` : "All listings"}
      </h1>

      {/* Filters — real GET form, no JS required, filters actually change the DB query above */}
      <form className="mt-6 flex flex-wrap gap-3 rounded-card border border-sandDeep bg-white p-4 dark:border-nightBorder dark:bg-nightCard">
        <input
          type="text"
          name="destination"
          defaultValue={searchParams.destination ?? ""}
          placeholder="Destination"
          className="rounded-md border border-sandDeep bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-savanna dark:border-nightBorder dark:text-nightInk"
        />
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search by name"
          className="rounded-md border border-sandDeep bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-savanna dark:border-nightBorder dark:text-nightInk"
        />
        <select
          name="type"
          defaultValue={searchParams.type ?? ""}
          className="rounded-md border border-sandDeep bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-savanna dark:border-nightBorder dark:text-nightInk"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-ink">
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-savanna px-5 py-2 text-sm font-medium text-white hover:bg-savannaDark"
        >
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="mt-10 text-ink/60 dark:text-nightInk/60">
          No listings match those filters yet. Try clearing a filter, or check back — more demo
          listings will be added as the marketplace grows.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              destinationName={listing.destination.name}
              destinationImageUrl={listing.destination.imageUrl}
              type={listing.type}
              basePriceCents={listing.basePriceCents}
              supplierName={listing.supplier.businessName}
              supplierVerified={listing.supplier.verificationStatus === "VERIFIED"}
              isSeedData={listing.isSeedData}
            />
          ))}
        </div>
      )}
    </main>
  );
}
