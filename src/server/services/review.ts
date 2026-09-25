import { prisma } from "@/lib/prisma";

export class ReviewError extends Error {}

export async function createReview(input: {
  bookingId: string;
  customerId: string;
  rating: number;
  comment: string;
}) {
  if (input.rating < 1 || input.rating > 5) {
    throw new ReviewError("Rating must be between 1 and 5.");
  }
  if (!input.comment.trim()) {
    throw new ReviewError("Please write a short comment.");
  }

  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });

  // Eligibility, enforced server-side regardless of what the UI shows:
  // must be your own booking, and the trip must actually be COMPLETED.
  // The DB's unique constraint on Review.bookingId is the second line of
  // defense against a duplicate review, but this check gives a clean
  // error message instead of a raw constraint violation.
  if (!booking || booking.customerId !== input.customerId) {
    throw new ReviewError("Booking not found.");
  }
  if (booking.bookingStatus !== "COMPLETED") {
    throw new ReviewError("You can only review a completed booking.");
  }

  const existing = await prisma.review.findUnique({ where: { bookingId: input.bookingId } });
  if (existing) {
    throw new ReviewError("You've already reviewed this booking.");
  }

  return prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: input.customerId,
      listingId: booking.listingId,
      rating: input.rating,
      comment: input.comment,
    },
  });
}
