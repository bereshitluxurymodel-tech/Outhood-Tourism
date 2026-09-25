import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId, listSupplierListings } from "@/server/services/supplier";
import { SupplierNav } from "@/components/SupplierNav";
import { formatKes, listingTypeLabel } from "@/lib/format";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "Pending review",
  APPROVED: "Live",
  REJECTED: "Rejected",
  INACTIVE: "Inactive",
};

export default async function SupplierListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) redirect("/supplier/apply");

  const listings = await listSupplierListings(supplier.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink dark:text-nightInk">Your listings</h1>
        <Link
          href="/supplier/listings/new"
          className="rounded-md bg-savanna px-4 py-2 text-sm font-medium text-white hover:bg-savannaDark"
        >
          New listing
        </Link>
      </div>
      <SupplierNav />

      {listings.length === 0 ? (
        <p className="mt-8 text-ink/60 dark:text-nightInk/60">
          You haven&apos;t created any listings yet.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/supplier/listings/${listing.id}/edit`}
              className="flex items-center justify-between p-4 hover:bg-sand dark:hover:bg-nightCard"
            >
              <div>
                <p className="font-medium text-ink dark:text-nightInk">{listing.title}</p>
                <p className="text-sm text-ink/60 dark:text-nightInk/60">
                  {listing.destination.name} · {listingTypeLabel(listing.type)} ·{" "}
                  {formatKes(listing.basePriceCents)}
                </p>
              </div>
              <span className="text-sm text-ink/50 dark:text-nightInk/50">
                {STATUS_LABEL[listing.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
