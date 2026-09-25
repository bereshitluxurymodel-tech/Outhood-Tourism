import { getListingById } from "@/server/services/listingSearch";
import { formatKes, listingTypeLabel } from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id);
  if (!listing) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {listing.destination.imageUrl ? (
        <div className="overflow-hidden rounded-card">
          <img src={listing.destination.imageUrl} alt={listing.destination.name} className="h-64 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-card bg-gradient-to-br from-acacia/20 to-savanna/20">
          <span className="text-ink/40 dark:text-nightInk/40">{listingTypeLabel(listing.type)}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {listing.isSeedData && (
            <span className="mb-2 inline-block rounded bg-sandDeep px-2 py-0.5 text-xs text-ink/60 dark:bg-nightBorder dark:text-nightInk/60">
              Demo listing — for simulation purposes only
            </span>
          )}
          <h1 className="font-display text-3xl text-ink dark:text-nightInk">{listing.title}</h1>
          <p className="mt-1 text-ink/60 dark:text-nightInk/60">
            {listing.destination.name} · {listingTypeLabel(listing.type)}
          </p>
          <p className="mt-1 text-sm text-ink/50 dark:text-nightInk/50">
            Hosted by {listing.supplier.businessName}
            {listing.supplier.verificationStatus === "VERIFIED" ? " · Verified supplier" : " · Pending verification"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-savannaDark dark:text-savanna">{formatKes(listing.basePriceCents)}</p>
          <p className="text-sm text-ink/50 dark:text-nightInk/50">per traveller</p>
        </div>
      </div>

      <p className="mt-6 whitespace-pre-line text-ink/80 dark:text-nightInk/80">{listing.description}</p>

      {listing.variants.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink dark:text-nightInk">Options</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {listing.variants.map((v) => (
              <div key={v.id} className="rounded-card border border-sandDeep p-4 dark:border-nightBorder">
                <p className="font-medium text-ink dark:text-nightInk">{v.name}</p>
                {v.priceOverrideCents != null && (
                  <p className="mt-1 text-sm text-savannaDark dark:text-savanna">{formatKes(v.priceOverrideCents)}</p>
                )}
                {v.maxCapacity != null && (
                  <p className="mt-1 text-sm text-ink/50 dark:text-nightInk/50">Up to {v.maxCapacity} people</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {listing.itineraryItems.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink dark:text-nightInk">Itinerary</h2>
          <div className="mt-3 space-y-3">
            {listing.itineraryItems.map((item) => (
              <div key={item.id} className="rounded-card border border-sandDeep p-4 dark:border-nightBorder">
                <p className="font-medium text-ink dark:text-nightInk">
                  Day {item.dayNumber}
                  {item.time ? ` · ${item.time}` : ""}
                </p>
                <p className="mt-1 text-ink/70 dark:text-nightInk/70">{item.activity}</p>
                {item.description && <p className="mt-1 text-sm text-ink/50 dark:text-nightInk/50">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink dark:text-nightInk">Cancellation policy</h2>
        <p className="mt-2 text-sm text-ink/60 dark:text-nightInk/60">{listing.cancellationPolicy}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink dark:text-nightInk">Reviews</h2>
        {listing.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50 dark:text-nightInk/50">No reviews yet.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {listing.reviews.map((r) => (
              <div key={r.id} className="border-b border-sandDeep pb-3 dark:border-nightBorder">
                <p className="text-sm font-medium text-ink dark:text-nightInk">
                  {r.customer.name} · {r.rating}/5
                </p>
                <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="sticky bottom-6 mt-10 flex justify-end">
        <Link
          href={`/booking/${listing.id}`}
          className="rounded-md bg-savanna px-8 py-3 font-medium text-white shadow-md hover:bg-savannaDark"
        >
          Book now
        </Link>
      </div>
    </main>
  );
}
