import { prisma } from "@/lib/prisma";
import type { ListingType, Prisma } from "@prisma/client";

export type ListingSearchParams = {
  destinationSlugOrName?: string;
  type?: ListingType;
  query?: string; // free-text match against title
  minPriceCents?: number;
  maxPriceCents?: number;
};

// Only APPROVED listings are ever publicly searchable — a PENDING_APPROVAL
// or REJECTED listing must never appear in customer-facing results, no
// matter what filters are applied.
export async function searchListings(params: ListingSearchParams) {
  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
  };

  if (params.type) {
    where.type = params.type;
  }
  if (params.destinationSlugOrName) {
    where.destination = {
      name: { contains: params.destinationSlugOrName, mode: "insensitive" },
    };
  }
  if (params.query) {
    where.title = { contains: params.query, mode: "insensitive" };
  }
  if (params.minPriceCents !== undefined || params.maxPriceCents !== undefined) {
    where.basePriceCents = {
      ...(params.minPriceCents !== undefined ? { gte: params.minPriceCents } : {}),
      ...(params.maxPriceCents !== undefined ? { lte: params.maxPriceCents } : {}),
    };
  }

  return prisma.listing.findMany({
    where,
    include: {
      destination: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      supplier: { select: { businessName: true, verificationStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findFirst({
    where: { id, status: "APPROVED" },
    include: {
      destination: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      itineraryItems: { orderBy: { dayNumber: "asc" } },
      supplier: { select: { businessName: true, verificationStatus: true, category: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10, include: { customer: { select: { name: true } } } },
    },
  });
}

export async function getDestinationByName(name: string) {
  return prisma.destination.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
}
