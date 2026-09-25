import { prisma } from "@/lib/prisma";
import type { ListingType } from "@prisma/client";

export class SupplierServiceError extends Error {}

export async function getSupplierByUserId(userId: string) {
  return prisma.supplier.findUnique({ where: { userId } });
}

/**
 * Turns an existing user into a supplier applicant. Deliberately pragmatic
 * for the demo: the user's role flips to SUPPLIER immediately (so they can
 * reach the supplier portal), but Supplier.verificationStatus stays PENDING
 * and every listing they create still starts PENDING_APPROVAL — so nothing
 * they do is customer-visible until an admin reviews it. This mirrors how
 * most real marketplaces let a seller start setting up shop right away,
 * while keeping the actual trust gate (verification + listing approval)
 * intact. Documented in docs/business-model.md.
 */
export async function applyAsSupplier(input: {
  userId: string;
  businessName: string;
  contactPerson: string;
  category: string;
  location: string;
  description: string;
  websiteUrl?: string;
}) {
  const existing = await getSupplierByUserId(input.userId);
  if (existing) {
    throw new SupplierServiceError("This account has already applied as a supplier.");
  }

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({
      data: {
        userId: input.userId,
        businessName: input.businessName,
        contactPerson: input.contactPerson,
        category: input.category,
        location: input.location,
        description: input.description,
        websiteUrl: input.websiteUrl,
        verificationStatus: "PENDING",
      },
    });
    await tx.user.update({ where: { id: input.userId }, data: { role: "SUPPLIER" } });
    return supplier;
  });
}

export async function listSupplierListings(supplierId: string) {
  return prisma.listing.findMany({
    where: { supplierId },
    include: { destination: true },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateListingInput = {
  supplierId: string;
  destinationId: string;
  type: ListingType;
  title: string;
  description: string;
  basePriceCents: number;
  cancellationPolicy: string;
  instantConfirm: boolean;
};

export async function createSupplierListing(input: CreateListingInput) {
  if (input.basePriceCents <= 0) {
    throw new SupplierServiceError("Price must be greater than zero.");
  }
  if (!input.title.trim() || !input.description.trim()) {
    throw new SupplierServiceError("Title and description are required.");
  }

  // Every new listing starts PENDING_APPROVAL regardless of who creates it
  // — a supplier can never make their own listing live without admin
  // review. This is enforced here, not just left to a default value, so
  // it can't be bypassed by a caller passing a different status.
  return prisma.listing.create({
    data: {
      supplierId: input.supplierId,
      destinationId: input.destinationId,
      type: input.type,
      title: input.title,
      description: input.description,
      basePriceCents: input.basePriceCents,
      cancellationPolicy: input.cancellationPolicy,
      instantConfirm: input.instantConfirm,
      status: "PENDING_APPROVAL",
      isSeedData: false,
    },
  });
}

export async function updateSupplierListing(
  listingId: string,
  supplierId: string,
  input: Partial<Omit<CreateListingInput, "supplierId">>
) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.supplierId !== supplierId) {
    throw new SupplierServiceError("Listing not found.");
  }

  // Editing an already-approved listing sends it back for re-approval —
  // an admin should see materially changed content before it stays live.
  // (Simplification for MVP: any edit re-triggers review, not just
  // "material" changes — a real system might diff price/description only.)
  const nextStatus = listing.status === "APPROVED" ? "PENDING_APPROVAL" : listing.status;

  return prisma.listing.update({
    where: { id: listingId },
    data: { ...input, status: nextStatus },
  });
}
