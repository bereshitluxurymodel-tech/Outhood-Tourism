import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

/**
 * MOCK payment flow for the MVP. This does not talk to a real gateway.
 * It exists so the booking + payment_status data model is exercised honestly
 * end-to-end. Architecture is deliberately provider-agnostic (see `provider`
 * field) so a real Kenyan gateway (e.g. M-Pesa) can be plugged in later
 * without touching the Booking or Payment schema.
 *
 * IMPORTANT: this never silently marks a payment PAID without going through
 * this explicit step, and it never touches card data — none is collected.
 */
export async function initiateMockPayment(bookingId: string, amountCents: number) {
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amountCents,
      status: "PENDING",
      provider: "MOCK_SANDBOX",
      transactionRef: `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`,
    },
  });
  await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: "PENDING" } });
  return payment;
}

// Simulates the gateway callback. In a real integration this would be a
// webhook handler verifying a signature from the provider — not a function
// the client can call directly with an arbitrary result.
export async function resolveMockPayment(paymentId: string, outcome: "PAID" | "FAILED") {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: outcome },
  });
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { paymentStatus: outcome },
  });
  return payment;
}
