import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminMetrics } from "@/server/services/admin";
import { AdminNav } from "@/components/AdminNav";
import { formatKes } from "@/lib/format";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/login");
  if (user?.role !== "ADMIN") redirect("/");

  const m = await getAdminMetrics();

  const cards = [
    { label: "Total users", value: m.totalUsers },
    { label: "Suppliers", value: m.totalSuppliers },
    { label: "Pending supplier applications", value: m.pendingSuppliers },
    { label: "Total listings", value: m.totalListings },
    { label: "Pending listings", value: m.pendingListings },
    { label: "Total bookings", value: m.totalBookings },
    { label: "Confirmed bookings", value: m.confirmedBookings },
    { label: "Cancelled bookings", value: m.cancelledBookings },
    { label: "Open complaints", value: m.openComplaints },
    { label: "Refund requests", value: m.refundRequests },
    { label: "Gross booking value (paid)", value: formatKes(m.grossBookingValueCents) },
    { label: "Outhood commission (paid)", value: formatKes(m.totalCommissionCents) },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Admin dashboard</h1>
      <AdminNav />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card border border-sandDeep p-4 dark:border-nightBorder">
            <p className="font-display text-xl text-ink dark:text-nightInk">{c.value}</p>
            <p className="mt-1 text-xs text-ink/60 dark:text-nightInk/60">{c.label}</p>
          </div>
        ))}
      </div>

      {m.pendingSuppliers + m.pendingListings > 0 && (
        <p className="mt-6 text-sm text-savannaDark dark:text-savanna">
          You have {m.pendingSuppliers} supplier application{m.pendingSuppliers === 1 ? "" : "s"} and{" "}
          {m.pendingListings} listing{m.pendingListings === 1 ? "" : "s"} waiting for review.
        </p>
      )}
    </main>
  );
}
