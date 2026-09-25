import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "./auditLog";

export async function getAdminMetrics() {
  const [
    totalUsers,
    totalSuppliers,
    pendingSuppliers,
    totalListings,
    pendingListings,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    openComplaints,
    refundRequests,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.supplier.count(),
    prisma.supplier.count({ where: { verificationStatus: "PENDING" } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { bookingStatus: "CONFIRMED" } }),
    prisma.booking.count({ where: { bookingStatus: "CANCELLED" } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW", "SUPPLIER_CONTACTED"] } } }),
    prisma.booking.count({ where: { bookingStatus: "REFUND_REQUESTED" } }),
    prisma.booking.aggregate({
      _sum: { totalAmountCents: true, commissionCents: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);

  return {
    totalUsers,
    totalSuppliers,
    pendingSuppliers,
    totalListings,
    pendingListings,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    openComplaints,
    refundRequests,
    grossBookingValueCents: revenueAgg._sum.totalAmountCents ?? 0,
    totalCommissionCents: revenueAgg._sum.commissionCents ?? 0,
  };
}

export async function listSuppliersForAdmin() {
  return prisma.supplier.findMany({
    include: { user: { select: { email: true } }, _count: { select: { listings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function setSupplierVerification(
  supplierId: string,
  status: "VERIFIED" | "REJECTED",
  actorId: string
) {
  const supplier = await prisma.supplier.update({
    where: { id: supplierId },
    data: { verificationStatus: status },
  });
  await writeAuditLog({
    actorId,
    action: status === "VERIFIED" ? "SUPPLIER_APPROVED" : "SUPPLIER_REJECTED",
    entityType: "Supplier",
    entityId: supplierId,
  });
  return supplier;
}

export async function listListingsForAdmin() {
  return prisma.listing.findMany({
    include: { destination: true, supplier: { select: { businessName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function setListingStatus(
  listingId: string,
  status: "APPROVED" | "REJECTED" | "INACTIVE",
  actorId: string
) {
  const listing = await prisma.listing.update({ where: { id: listingId }, data: { status } });
  await writeAuditLog({
    actorId,
    action: `LISTING_${status}`,
    entityType: "Listing",
    entityId: listingId,
  });
  return listing;
}

export async function listBookingsForAdmin() {
  return prisma.booking.findMany({
    include: {
      listing: { select: { title: true } },
      supplier: { select: { businessName: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // MVP cap — pagination is a future step, not built now
  });
}

export async function listComplaintsForAdmin() {
  return prisma.complaint.findMany({
    include: {
      booking: { select: { reference: true } },
      customer: { select: { name: true } },
      recoveryActions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
