import { prisma } from "@/lib/prisma";

export async function getBookingByReference(reference: string) {
  return prisma.booking.findUnique({
    where: { reference },
    include: {
      listing: { include: { destination: true } },
      travellers: true,
      payments: { orderBy: { createdAt: "desc" } },
      review: true,
      complaints: { orderBy: { createdAt: "desc" } },
    },
  });
}
