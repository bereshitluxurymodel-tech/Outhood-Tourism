import { getBookingByReference } from "@/server/services/bookingQuery";
import { formatKes } from "@/lib/format";
import { notFound } from "next/navigation";
import { PayNowButton } from "@/components/PayNowButton";
import { ReviewForm } from "@/components/ReviewForm";
import { ComplaintForm } from "@/components/ComplaintForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function BookingConfirmationPage({
  params,
}: {
  params: { reference: string };
}) {
  const session = await getServerSession(authOptions);
  const booking = await getBookingByReference(params.reference);

  // Ownership check: a booking reference alone must not be enough to view
  // another customer's traveller names and price — only the customer who
  // made the booking (or an admin) can see this page.
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;
  if (!booking || (booking.customerId !== sessionUser?.id && sessionUser?.role !== "ADMIN")) {
    return notFound();
  }

  const latestPayment = booking.payments[0];

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-sm text-acacia">Booking {booking.bookingStatus.toLowerCase()}</p>
      <h1 className="font-display text-3xl text-ink dark:text-nightInk">
        Reference {booking.reference}
      </h1>

      <div className="mt-6 rounded-card border border-sandDeep bg-white p-5 dark:border-nightBorder dark:bg-nightCard">
        <p className="font-medium text-ink dark:text-nightInk">{booking.listing.title}</p>
        <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">
          {booking.listing.destination.name} · {new Date(booking.startDate).toLocaleDateString("en-KE")}
        </p>
        <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">
          {booking.travellerCount} traveller{booking.travellerCount > 1 ? "s" : ""}:{" "}
          {booking.travellers.map((t) => t.fullName).join(", ")}
        </p>

        <div className="mt-4 border-t border-sandDeep pt-4 dark:border-nightBorder">
          <div className="flex justify-between text-sm text-ink/70 dark:text-nightInk/70">
            <span>Base amount</span>
            <span>{formatKes(booking.baseAmountCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/70 dark:text-nightInk/70">
            <span>Outhood service fee</span>
            <span>{formatKes(booking.commissionCents)}</span>
          </div>
          <div className="mt-1 flex justify-between font-medium text-ink dark:text-nightInk">
            <span>Total</span>
            <span>{formatKes(booking.totalAmountCents)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-ink dark:text-nightInk">
          Payment status: {latestPayment?.status ?? "UNPAID"}
        </p>
        {latestPayment && latestPayment.status === "PENDING" && (
          <PayNowButton paymentId={latestPayment.id} />
        )}
        {latestPayment?.status === "PAID" && (
          <p className="mt-2 text-sm text-acacia">Payment confirmed. Have a great trip!</p>
        )}
        {latestPayment?.status === "FAILED" && (
          <p className="mt-2 text-sm text-red-600">
            Payment failed in the simulation — refresh and try again.
          </p>
        )}
      </div>

      {booking.bookingStatus === "COMPLETED" && (
        <div className="mt-6">
          <p className="text-sm font-medium text-ink dark:text-nightInk">Your review</p>
          {booking.review ? (
            <div className="mt-2 rounded-card border border-sandDeep p-4 dark:border-nightBorder">
              <p className="text-sm text-ink dark:text-nightInk">{booking.review.rating}/5</p>
              <p className="mt-1 text-sm text-ink/70 dark:text-nightInk/70">{booking.review.comment}</p>
            </div>
          ) : (
            <ReviewForm bookingId={booking.id} />
          )}
        </div>
      )}

      <div className="mt-6">
        {booking.complaints.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {booking.complaints.map((c) => (
              <div key={c.id} className="rounded-card border border-sandDeep p-3 text-sm dark:border-nightBorder">
                <p className="text-ink dark:text-nightInk">
                  {c.category} · {c.status}
                </p>
                <p className="mt-1 text-ink/60 dark:text-nightInk/60">{c.description}</p>
              </div>
            ))}
          </div>
        )}
        <ComplaintForm bookingId={booking.id} />
      </div>
    </main>
  );
}
