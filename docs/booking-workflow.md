# Booking Workflow

## State machine
```
PENDING ──────► CONFIRMED ──────► COMPLETED ──────► REFUND_REQUESTED ──► REFUNDED
   │                │                                      │
   ├──► REJECTED     ├──► CANCELLED                         └──► CONFIRMED (refund denied,
   └──► CANCELLED    └──► REFUND_REQUESTED                       booking stands)
```
Enforced centrally in `src/server/services/bookingStateMachine.ts` — every
other layer calls `assertValidTransition(from, to)` before writing a
status change. No caller (including admin override tooling) is allowed to
skip this check; an "admin override" is implemented as a normal
transition through the same function, just performed by an ADMIN-role
actor, and is still audit-logged.

## Default flow (instant-confirm, MVP default)
1. Customer submits booking → availability decremented, booking created
   directly as **CONFIRMED**, payment created as UNPAID → PENDING.
2. Customer completes (mock) payment → PENDING → PAID.
3. Trip date passes → booking manually or automatically marked COMPLETED
   (MVP: manual by admin; automatic date-based job is a future step).
4. Customer becomes eligible to leave a review only once COMPLETED.

## Alternative flow (request-to-book, available per listing)
Set `Listing.instantConfirm = false`. Booking is created as PENDING;
supplier must explicitly accept (→ CONFIRMED) or reject (→ REJECTED)
from the supplier portal before payment is captured.

## Idempotency
Every booking submission carries a client-generated `idempotencyKey`
(UUID). Resubmitting the same key (e.g. from a double-click or a retried
request) returns the already-created booking instead of creating a
duplicate — see `src/server/services/booking.ts`.

## Payments
Payments are modelled honestly: `UNPAID → PENDING → PAID/FAILED`, with a
separate `Refund` record for `REFUNDED`/`PARTIALLY_REFUNDED`. The MVP uses
a mock provider (`MOCK_SANDBOX`) that never claims a payment succeeded
without going through an explicit resolution step — see
`src/server/services/payment.ts`. No card data is ever stored.
