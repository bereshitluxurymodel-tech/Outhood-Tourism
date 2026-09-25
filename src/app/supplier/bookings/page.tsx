import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { listSupplierBookings } from "@/server/services/supplierBooking";
import { SupplierNav } from "@/components/SupplierNav";
import { SupplierBookingActions } from "@/components/SupplierBookingActions";
import { formatKes } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function SupplierBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) redirect("/supplier/apply");

  const bookings = await listSupplierBookings(supplier.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Bookings</h1>
      <SupplierNav />

      {bookings.length === 0 ? (
        <p className="mt-8 text-ink/60 dark:text-nightInk/60">No bookings yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
          {bookings.map((b) => (
            <div key={b.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink dark:text-nightInk">
                    {b.reference} · {b.listing.title}
                  </p>
                  <p className="text-sm text-ink/60 dark:text-nightInk/60">
                    {b.customer.name} · {new Date(b.startDate).toLocaleDateString("en-KE")} ·{" "}
                    {b.travellerCount} traveller{b.travellerCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-ink/60 dark:text-nightInk/60">
                    {formatKes(b.totalAmountCents)} · Payment: {b.paymentStatus}
                  </p>
                </div>
                <span className="rounded bg-sandDeep px-2 py-1 text-xs text-ink/70 dark:bg-nightBorder dark:text-nightInk/70">
                  {b.bookingStatus}
                </span>
              </div>
              <SupplierBookingActions bookingId={b.id} status={b.bookingStatus} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
