import { prisma } from "@/lib/prisma";
import { assertValidTransition, InvalidBookingTransitionError } from "./bookingStateMachine";
import type { BookingStatus } from "@prisma/client";

export { InvalidBookingTransitionError };

export async function listSupplierBookings(supplierId: string) {
  return prisma.booking.findMany({
    where: { supplierId },
    include: {
      listing: true,
      travellers: true,
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function transitionSupplierBooking(
  bookingId: string,
  supplierId: string,
  to: BookingStatus
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  // Ownership check: a supplier can only change the status of bookings
  // against THEIR OWN listings — this is checked here, not assumed from
  // the fact the request reached this far.
  if (!booking || booking.supplierId !== supplierId) {
    throw new Error("Booking not found.");
  }

  assertValidTransition(booking.bookingStatus, to);

  return prisma.booking.update({ where: { id: bookingId }, data: { bookingStatus: to } });
}
