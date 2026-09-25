# Database

Full schema: `prisma/schema.prisma`. This doc explains relationships and
non-obvious decisions; see that file for exact fields/types.

## Entity groups
- **Users & auth**: `User` (role: CUSTOMER/SUPPLIER/ADMIN), `Supplier` is a
  1:1 extension of a `User` with role SUPPLIER.
- **Catalog**: `Destination` → `Listing` (type: ACCOMMODATION / EXPERIENCE
  / TOUR_PACKAGE) → `ListingImage`, `ListingVariant` (room types / group
  sizes), `Availability` (per date, optionally per variant),
  `ItineraryItem` (multi-day listings only).
- **Transactions**: `Booking` → `Traveller`, `Payment` → `Refund`.
- **Pricing**: `Commission` — resolved listing > supplier > category >
  global default (see `src/server/services/commission.ts`). Money is
  stored as integer cents (`*Cents` fields) to avoid float rounding bugs.
- **Post-booking**: `Review` (unique per booking — DB-level constraint,
  not just app logic), `Complaint` → `ServiceRecovery` (the audit trail
  for how a complaint was resolved).
- **Ops**: `Notification`, `AuditLog`.

## Notable design choices
- **`Booking.supplierId` is denormalized** (also derivable via
  `listing.supplierId`) purely so the supplier dashboard can query
  "my bookings" with one index instead of a join on every request.
- **`Booking.idempotencyKey` is unique** — the client generates a UUID
  once per booking attempt; resubmitting the same key returns the
  existing booking instead of creating a duplicate.
- **`Review.bookingId` is unique** — enforces "one review per booking" at
  the database level so it can't be bypassed by a bug in application code.
- **`Commission` rows are optional and hierarchical** rather than one row
  per listing — lets admin set one sensible default and override only
  where needed.

## Hosting
Neon (Postgres, free tier) for the database. `DATABASE_URL` uses Neon's
pooled connection string; `DIRECT_URL` (non-pooled) is required by Prisma
for running migrations — both are in `.env.example`.
