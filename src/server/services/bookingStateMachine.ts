import type { BookingStatus } from "@prisma/client";

// Documented state machine. Any transition not listed here is illegal and
// must be rejected by the service layer, regardless of who is asking.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED", "REFUND_REQUESTED"],
  REJECTED: [], // terminal
  CANCELLED: [], // terminal
  COMPLETED: ["REFUND_REQUESTED"],
  REFUND_REQUESTED: ["REFUNDED", "CONFIRMED"], // CONFIRMED = refund request denied, booking stands
  REFUNDED: [], // terminal
};

export class InvalidBookingTransitionError extends Error {
  constructor(from: BookingStatus, to: BookingStatus) {
    super(`Cannot transition booking from ${from} to ${to}`);
    this.name = "InvalidBookingTransitionError";
  }
}

export function assertValidTransition(from: BookingStatus, to: BookingStatus) {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidBookingTransitionError(from, to);
  }
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}
