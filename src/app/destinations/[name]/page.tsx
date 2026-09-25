import { getDestinationByName, searchListings } from "@/server/services/listingSearch";
import { ListingCard } from "@/components/ListingCard";
import { notFound } from "next/navigation";

export default async function DestinationPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name);
  const destination = await getDestinationByName(decodedName);
  if (!destination) return notFound();

  const listings = await searchListings({ destinationSlugOrName: destination.name });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {destination.imageUrl && (
        <div className="mb-6">
          <div className="overflow-hidden rounded-card">
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="h-64 w-full object-cover"
            />
          </div>
          <p className="mt-1 text-xs text-ink/40 dark:text-nightInk/40">Photo: Wikimedia Commons</p>
        </div>
      )}
      <p className="text-sm text-acacia dark:text-savanna">{destination.region}</p>
      <h1 className="font-display text-4xl text-ink dark:text-nightInk">{destination.name}</h1>
      <p className="mt-3 max-w-2xl text-ink/70 dark:text-nightInk/70">{destination.description}</p>

      <h2 className="mt-10 font-display text-xl text-ink dark:text-nightInk">Listings in {destination.name}</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-ink/60 dark:text-nightInk/60">No listings yet for this destination.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
