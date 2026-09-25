import { getListingById } from "@/server/services/listingSearch";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { formatKes, listingTypeLabel } from "@/lib/format";

export default async function BookingPage({ params }: { params: { listingId: string } }) {
  const listing = await getListingById(params.listingId);
  if (!listing) return notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-sm text-ink/60 dark:text-nightInk/60">
        {listing.destination.name} · {listingTypeLabel(listing.type)}
      </p>
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">{listing.title}</h1>
      <p className="mt-1 text-savannaDark">{formatKes(listing.basePriceCents)} per traveller</p>

      <BookingForm listingId={listing.id} title={listing.title} basePriceCents={listing.basePriceCents} />
    </main>
  );
}
