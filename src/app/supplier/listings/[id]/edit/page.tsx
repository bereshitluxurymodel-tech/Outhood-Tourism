import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";
import { redirect, notFound } from "next/navigation";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) redirect("/supplier/apply");

  const [listing, destinations] = await Promise.all([
    prisma.listing.findUnique({ where: { id: params.id } }),
    prisma.destination.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Ownership check: a supplier can only reach the edit form for THEIR OWN
  // listing — this is checked server-side before the page even renders,
  // not just enforced when the form submits.
  if (!listing || listing.supplierId !== supplier.id) {
    return notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Edit listing</h1>
      <ListingForm
        destinations={destinations}
        listingId={listing.id}
        initial={{
          destinationId: listing.destinationId,
          type: listing.type,
          title: listing.title,
          description: listing.description,
          basePriceCents: listing.basePriceCents,
          cancellationPolicy: listing.cancellationPolicy,
          instantConfirm: listing.instantConfirm,
        }}
      />
    </main>
  );
}
