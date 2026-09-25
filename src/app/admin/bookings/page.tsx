import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listBookingsForAdmin } from "@/server/services/admin";
import { AdminNav } from "@/components/AdminNav";
import { formatKes } from "@/lib/format";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/login");
  if (user?.role !== "ADMIN") redirect("/");

  const bookings = await listBookingsForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Bookings</h1>
      <AdminNav />
      <p className="mt-4 text-sm text-ink/50 dark:text-nightInk/50">
        Read-only for now — showing the most recent 100. Overriding a booking status directly is a
        future step; use the supplier or customer flows for normal status changes.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-sandDeep dark:border-nightBorder">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sandDeep text-ink/60 dark:border-nightBorder dark:text-nightInk/60">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Listing</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sandDeep dark:divide-nightBorder">
            {bookings.map((b) => (
              <tr key={b.id} className="text-ink dark:text-nightInk">
                <td className="p-3">{b.reference}</td>
                <td className="p-3">{b.customer.name}</td>
                <td className="p-3">{b.listing.title}</td>
                <td className="p-3">{b.supplier.businessName}</td>
                <td className="p-3">{formatKes(b.totalAmountCents)}</td>
                <td className="p-3">{b.paymentStatus}</td>
                <td className="p-3">{b.bookingStatus}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-ink/60 dark:text-nightInk/60">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
