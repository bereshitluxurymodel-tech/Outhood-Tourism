import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { prisma } from "@/lib/prisma";
import { SupplierNav } from "@/components/SupplierNav";
import { redirect } from "next/navigation";

export default async function SupplierDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) redirect("/supplier/apply");

  const [listingCount, approvedCount, bookingCount, pendingBookingCount] = await Promise.all([
    prisma.listing.count({ where: { supplierId: supplier.id } }),
    prisma.listing.count({ where: { supplierId: supplier.id, status: "APPROVED" } }),
    prisma.booking.count({ where: { supplierId: supplier.id } }),
    prisma.booking.count({ where: { supplierId: supplier.id, bookingStatus: "PENDING" } }),
  ]);

  const statusCopy: Record<string, string> = {
    PENDING: "Your account is awaiting admin review. You can still set up listings now — they'll go live once you're verified.",
    VERIFIED: "Your account is verified.",
    REJECTED: "Your application was not approved. Contact support for details.",
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">{supplier.businessName}</h1>
      <SupplierNav />

      <div className="mt-6 rounded-card border border-sandDeep bg-white p-4 dark:border-nightBorder dark:bg-nightCard">
        <p className="text-sm font-medium text-ink dark:text-nightInk">
          Verification status: {supplier.verificationStatus}
        </p>
        <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">
          {statusCopy[supplier.verificationStatus]}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Listings", value: listingCount },
          { label: "Approved & live", value: approvedCount },
          { label: "Total bookings", value: bookingCount },
          { label: "Awaiting your response", value: pendingBookingCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card border border-sandDeep p-4 dark:border-nightBorder">
            <p className="font-display text-2xl text-ink dark:text-nightInk">{stat.value}</p>
            <p className="mt-1 text-xs text-ink/60 dark:text-nightInk/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
