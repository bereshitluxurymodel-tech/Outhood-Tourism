import { prisma } from "@/lib/prisma";
import { resolveCommissionRate, calculateCommission } from "./commission";
import { randomUUID } from "crypto";

export class BookingValidationError extends Error {}

function generateReference(): string {
  // e.g. OUT-7K2Q9X — short, human-readable, unique enough for a demo (DB-unique enforced regardless)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `OUT-${suffix}`;
}

export async function createBooking(input: {
  customerId: string;
  listingId: string;
  variantId?: string;
  startDate: Date;
  endDate?: Date;
  travellerCount: number;
  travellers: { fullName: string; contact?: string }[];
  idempotencyKey: string;
}) {
  const { customerId, listingId, variantId, startDate, endDate, travellerCount, travellers, idempotencyKey } = input;

  // Idempotency: if this exact submission already produced a booking, return it
  // instead of creating a duplicate (protects against double-click / retry).
  const existing = await prisma.booking.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  if (travellerCount < 1) {
    throw new BookingValidationError("At least one traveller is required.");
  }
  if (travellers.length !== travellerCount) {
    throw new BookingValidationError("Traveller details must match traveller count.");
  }
  if (endDate && endDate < startDate) {
    throw new BookingValidationError("End date cannot be before start date.");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    throw new BookingValidationError("Travel date cannot be in the past.");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { supplier: true },
  });
  if (!listing || listing.status !== "APPROVED") {
    throw new BookingValidationError("This listing is not currently bookable.");
  }

  // Availability check (defensive: also re-checked inside the transaction below
  // to avoid a race between two customers booking the last unit simultaneously).
  const availability = await prisma.availability.findFirst({
    where: { listingId, variantId: variantId ?? null, date: startDate },
  });
  if (availability && availability.quantity < travellerCount) {
    throw new BookingValidationError("Not enough availability for the selected date.");
  }

  const basePriceCents = listing.basePriceCents;
  const rate = await resolveCommissionRate({
    listingId: listing.id,
    supplierId: listing.supplierId,
    listingType: listing.type,
  });
  const { commissionCents, totalAmountCents } = calculateCommission(basePriceCents * travellerCount, rate);

  // Per product decision: instant-confirm is the MVP default customer experience.
  // Supplier can still cancel/manage afterward, but the traveller isn't left
  // waiting on a confirmation step during the demo flow.
  const initialStatus = listing.instantConfirm ? "CONFIRMED" : "PENDING";

  const booking = await prisma.$transaction(async (tx) => {
    if (availability) {
      const updated = await tx.availability.updateMany({
        where: { id: availability.id, quantity: { gte: travellerCount } },
        data: { quantity: { decrement: travellerCount } },
      });
      if (updated.count === 0) {
        throw new BookingValidationError("Availability changed — please try again.");
      }
    }

    return tx.booking.create({
      data: {
        reference: generateReference(),
        idempotencyKey,
        customerId,
        listingId,
        variantId,
        supplierId: listing.supplierId,
        startDate,
        endDate,
        travellerCount,
        baseAmountCents: basePriceCents * travellerCount,
        commissionCents,
        totalAmountCents,
        bookingStatus: initialStatus,
        paymentStatus: "UNPAID",
        travellers: { create: travellers.map((t) => ({ fullName: t.fullName, contact: t.contact })) },
      },
    });
  });

  return booking;
}

export function newIdempotencyKey(): string {
  return randomUUID();
}
