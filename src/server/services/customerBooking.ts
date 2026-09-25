import { prisma } from "@/lib/prisma";

export async function listCustomerBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    include: {
      listing: { include: { destination: true } },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
