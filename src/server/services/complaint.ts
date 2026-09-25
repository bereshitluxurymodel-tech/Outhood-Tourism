import { prisma } from "@/lib/prisma";

export class ComplaintError extends Error {}

export async function createComplaint(input: {
  bookingId: string;
  customerId: string;
  category: string;
  description: string;
  priority: string;
}) {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });

  // Ownership check: you can only file a complaint against your OWN
  // booking — not just any booking whose ID you happen to know.
  if (!booking || booking.customerId !== input.customerId) {
    throw new ComplaintError("Booking not found.");
  }
  if (!input.description.trim()) {
    throw new ComplaintError("Please describe the issue.");
  }

  return prisma.complaint.create({
    data: {
      bookingId: booking.id,
      customerId: input.customerId,
      category: input.category,
      description: input.description,
      priority: input.priority,
      status: "OPEN",
    },
  });
}
