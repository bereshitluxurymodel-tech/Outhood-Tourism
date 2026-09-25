import { prisma } from "@/lib/prisma";
import type { ListingType } from "@prisma/client";

// Global fallback rate if nothing more specific is configured.
// This is a DEMO default for the simulation, not a claimed real-world rate.
const GLOBAL_DEFAULT_RATE_PERCENT = 12;

/**
 * Resolves the commission rate for a given listing using the hierarchy:
 * listing-specific override > supplier-specific override > category override > global default.
 * Returns a percentage (e.g. 12 means 12%).
 */
export async function resolveCommissionRate(params: {
  listingId: string;
  supplierId: string;
  listingType: ListingType;
}): Promise<number> {
  const { listingId, supplierId, listingType } = params;

  const listingOverride = await prisma.commission.findUnique({ where: { listingId } });
  if (listingOverride) return listingOverride.ratePercent;

  const supplierOverride = await prisma.commission.findFirst({
    where: { supplierId, listingId: null },
  });
  if (supplierOverride) return supplierOverride.ratePercent;

  const categoryOverride = await prisma.commission.findFirst({
    where: { category: listingType, supplierId: null, listingId: null },
  });
  if (categoryOverride) return categoryOverride.ratePercent;

  return GLOBAL_DEFAULT_RATE_PERCENT;
}

/**
 * Computes commission and total in integer cents from a base amount and rate.
 * Rounds commission to the nearest cent; total = base + commission (customer pays
 * base + commission; supplier is paid base). Kept as a pure function so it's
 * trivially unit-testable without touching the database.
 */
export function calculateCommission(baseAmountCents: number, ratePercent: number) {
  if (baseAmountCents < 0) throw new Error("baseAmountCents cannot be negative");
  if (ratePercent < 0) throw new Error("ratePercent cannot be negative");

  const commissionCents = Math.round(baseAmountCents * (ratePercent / 100));
  const totalAmountCents = baseAmountCents + commissionCents;
  const supplierPayableCents = baseAmountCents;

  return { commissionCents, totalAmountCents, supplierPayableCents };
}
