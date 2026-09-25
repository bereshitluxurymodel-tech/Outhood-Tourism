import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listListingsForAdmin } from "@/server/services/admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminListingActions } from "@/components/AdminListingActions";
import { formatKes, listingTypeLabel } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "Pending review",
  APPROVED: "Live",
  REJECTED: "Rejected",
  INACTIVE: "Inactive",
};

export default async function AdminListingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/login");
  if (user?.role !== "ADMIN") redirect("/");

  const listings = await listListingsForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Listings</h1>
      <AdminNav />

      <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
        {listings.map((listing) => (
          <div key={listing.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink dark:text-nightInk">{listing.title}</p>
                <p className="text-sm text-ink/60 dark:text-nightInk/60">
                  {listing.supplier.businessName} · {listing.destination.name} ·{" "}
                  {listingTypeLabel(listing.type)} · {formatKes(listing.basePriceCents)}
                </p>
              </div>
              <span className="rounded bg-sandDeep px-2 py-1 text-xs text-ink/70 dark:bg-nightBorder dark:text-nightInk/70">
                {STATUS_LABEL[listing.status]}
              </span>
            </div>
            <AdminListingActions listingId={listing.id} status={listing.status} />
          </div>
        ))}
        {listings.length === 0 && (
          <p className="p-4 text-ink/60 dark:text-nightInk/60">No listings yet.</p>
        )}
      </div>
    </main>
  );
}
