# Security

## Authentication
Auth.js (NextAuth) with a credentials provider; passwords hashed with
bcrypt (never stored in plaintext, never logged). Sessions are JWT-based.

## Authorization — two layers, both required
1. **Middleware** (`src/middleware.ts`) — coarse gate on route trees
   (`/admin/*`, `/supplier/*`, `/dashboard/*`) based on session role.
   This stops a wrong-role user from even loading the page shell.
2. **Per-resource checks in the service layer** — every mutation
   (e.g. a supplier accepting a booking) re-checks that the authenticated
   user actually owns the resource they're modifying
   (`booking.supplierId === session.supplier.id`), server-side, on every
   request. The middleware layer is never treated as sufficient on its
   own — a role check without an ownership check would let any supplier
   modify any other supplier's bookings.

## Input handling
- All API input validated with Zod schemas before it reaches the service
  layer.
- All database access goes through Prisma's parameterized queries — no
  raw SQL string concatenation, which structurally prevents SQL
  injection.
- React/JSX auto-escapes rendered output; any user-generated HTML (none
  planned for MVP — reviews/complaints are plain text) would be
  explicitly sanitized before rendering if ever introduced.

## Secrets
All secrets (DB URL, `NEXTAUTH_SECRET`) live in environment variables,
never committed. `.env.example` documents required variables with no real
values. Render's environment variable manager holds production secrets.

## Payments & PII
No card numbers, CVVs, or other payment credentials are ever collected or
stored — the mock payment flow only stores a status and a reference
string. Traveller data collected at booking is deliberately minimal
(name, contact) — see `docs/database.md`.

## Auditability
Sensitive admin actions (supplier approval, listing approval, booking
status override, refund issued, complaint resolved, commission changed)
write an `AuditLog` row: actor, action, entity, timestamp, metadata.

## Known gaps in the MVP (documented, not hidden)
- No rate limiting implemented yet on auth endpoints — flagged as a
  pre-production requirement, not done for the demo.
- No CSRF token beyond what Auth.js provides by default for its own
  endpoints — custom API routes rely on same-site cookies; a dedicated
  CSRF token would be added before any real payment integration.
- File upload validation (type/size limits) is scaffolded but not yet
  wired to a real storage backend in this phase.
