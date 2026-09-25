import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createBooking, BookingValidationError } from "@/server/services/booking";
import { initiateMockPayment } from "@/server/services/payment";

const bodySchema = z.object({
  listingId: z.string().min(1),
  startDate: z.string().min(1), // ISO date string from <input type="date">
  travellerCount: z.number().int().min(1),
  travellers: z.array(z.object({ fullName: z.string().min(1), contact: z.string().optional() })).min(1),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: Request) {
  // Server-side session check — the customerId always comes from the
  // authenticated session, never from the request body, so a client can't
  // forge a booking under someone else's account.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to book." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }
  const { listingId, startDate, travellerCount, travellers, idempotencyKey } = parsed.data;

  try {
    const booking = await createBooking({
      customerId: (session.user as { id: string }).id,
      listingId,
      startDate: new Date(startDate),
      travellerCount,
      travellers,
      idempotencyKey,
    });

    // Kick off the mock payment immediately so the confirmation page has
    // something to resolve — mirrors how a real gateway redirect would work.
    const payment = await initiateMockPayment(booking.id, booking.totalAmountCents);

    return NextResponse.json({ reference: booking.reference, paymentId: payment.id });
  } catch (err) {
    if (err instanceof BookingValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong creating the booking." }, { status: 500 });
  }
}
