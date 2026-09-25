# Outhood — OTA MVP (university simulation)

A two-sided Online Travel Agency marketplace for Kenyan tourism, built
for a university travel-agency simulation assignment. See `/docs` for
architecture, database, business model, booking workflow, security, and
the full assignment-requirement mapping.

**Status: Phase 1 (Foundation) complete.** Auth, database schema, core
booking/commission business logic, and homepage visual direction are
built. Search, listing pages, supplier portal, admin dashboard, and
complaints UI are scaffolded in the schema but not yet built as pages —
see `docs/architecture.md` → "What's NOT built yet".

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Neon) ·
Prisma · Auth.js (NextAuth) · deployed on Render.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Neon project** at https://neon.tech (free tier). Copy the
   pooled connection string and the direct (non-pooled) connection
   string.

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from Neon.
   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   ```

5. **Seed demo data**
   ```bash
   npm run db:seed
   ```
   This creates three demo accounts (password `Outhood!Demo1` for all —
   development only, never reuse):
   - `admin@outhood.dev` — ADMIN
   - `supplier@outhood.dev` — SUPPLIER
   - `customer@outhood.dev` — CUSTOMER

   It also seeds four Kenyan destinations and one demo listing, all
   flagged `isSeedData: true`.

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Testing
```bash
npm test
```
Covers commission calculation and the booking state machine to start
(Phase 8 will expand this to booking validation, role permissions, and
review/complaint eligibility per the assignment's testing requirement).

## Deployment (Render)
1. Push this repo to GitHub.
2. In Render: New → Web Service → connect the repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add the same environment variables from `.env` in Render's dashboard.
6. Run `npm run db:deploy` (Prisma migrate deploy) against the Neon
   database as part of your first deploy, or from your local machine
   pointed at the production `DATABASE_URL`.

## Known limitations (see docs for full detail)
- Payments are mocked — no real money moves, no real gateway integrated.
- Booking defaults to instant-confirm rather than request-to-book (a
  documented product decision — see `docs/business-model.md`).
- No email/SMS/WhatsApp notifications yet (in-app only, and not yet
  built as UI).
- Legal/compliance copy (privacy policy, cancellation policy, supplier
  licensing claims) is placeholder and marked `TO BE VERIFIED` — none of
  it should be treated as actual legal compliance.

## Next steps
See `docs/architecture.md` and the implementation plan for Phases 2–8
(marketplace core, booking UI, supplier portal, admin dashboard, customer
experience, polish, testing).
