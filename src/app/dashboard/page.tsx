import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listCustomerBookings } from "@/server/services/customerBooking";
import { formatKes } from "@/lib/format";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const bookings = await listCustomerBookings((session.user as { id: string }).id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Your bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-8 text-ink/60 dark:text-nightInk/60">
          No bookings yet — go <Link href="/search" className="underline">browse listings</Link>.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/booking/confirmation/${b.reference}`}
              className="flex items-center justify-between p-4 hover:bg-sand dark:hover:bg-nightCard"
            >
              <div>
                <p className="font-medium text-ink dark:text-nightInk">{b.listing.title}</p>
                <p className="text-sm text-ink/60 dark:text-nightInk/60">
                  {b.listing.destination.name} · {new Date(b.startDate).toLocaleDateString("en-KE")} ·{" "}
                  {formatKes(b.totalAmountCents)}
                </p>
                {b.review && (
                  <p className="mt-1 text-xs text-savannaDark dark:text-savanna">
                    You rated this {b.review.rating}/5
                  </p>
                )}
              </div>
              <span className="text-sm text-ink/50 dark:text-nightInk/50">{b.bookingStatus}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
