# Architecture

## Overview
Outhood is a Next.js (App Router) monolith: React/TypeScript frontend,
Next.js API routes as the backend, PostgreSQL (hosted on Neon) as the
database, Prisma as the ORM, and Auth.js (NextAuth) for authentication.
Deployed on Render.

## Layers
1. **UI (React/TSX)** — pages and components. Never talks to the database
   directly; always goes through an API route.
2. **API routes** — thin. Parse/validate the request (Zod), check the
   session, call the service layer, return a response. No business logic
   lives here.
3. **Service layer** (`src/server/services/*`) — all business rules:
   booking state transitions, commission resolution, pricing, validation.
   Pure functions where possible, so they're unit-testable without a
   database (see `commission.ts` and `bookingStateMachine.ts`).
4. **Prisma / PostgreSQL** — persistence. No raw SQL string concatenation
   anywhere; all queries go through Prisma's parameterized query builder.

## Why this stack
- Next.js API routes avoid standing up a separate backend service for an
  MVP of this scope — one deployable unit, one Render service.
- Prisma gives type-safe queries and migrations, and structurally
  eliminates SQL injection.
- Auth.js is the standard, audited auth library for this stack rather than
  hand-rolled session/password handling.

## Deliberate MVP simplifications (documented, not hidden)
- **Instant-confirm booking is the default** rather than request-to-book.
  This was a product decision (see `docs/business-model.md`) made to keep
  the demo flow simple; the `Listing.instantConfirm` flag and the full
  PENDING/CONFIRMED state machine both still exist, so request-to-book can
  be re-enabled per listing without a schema change.
- **Tour packages reuse the `Listing` table** (`type = TOUR_PACKAGE`)
  instead of a separate table, to avoid duplicating price/availability/
  image logic three times over.
- **Payments are mocked** (`MOCK_SANDBOX` provider) — the payment/refund
  data model is real and exercised end-to-end, but no money moves. Real
  M-Pesa integration is a documented future step, not built now.
- **File storage** is local-disk in dev, behind a driver interface, so it
  can be pointed at an S3-compatible bucket later without touching calling
  code.

## What's NOT built yet (see implementation plan)
Search/filter wiring, listing detail pages, the booking UI flow, supplier
portal UI, admin dashboard UI, complaints UI, and reviews UI are schema-
and service-layer complete but not yet built as pages — that's Phases 2–6.
