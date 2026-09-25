# Business Model

## What Outhood is
A two-sided OTA marketplace connecting Kenyan travel suppliers
(accommodation, tour operators, activity/experience providers) with
travellers, focused on Kenyan domestic tourism (safaris, stays, short
trips, adventure activities).

## Target market
- **Travellers**: primarily Kenyan domestic tourists; secondarily
  diaspora/international visitors researching Kenya.
- **Suppliers**: independent lodges, camps, tour operators and activity
  providers without their own booking technology.

## Revenue model
**Commission** is the primary MVP revenue model. Outhood takes a
percentage of each booking's base price; the supplier receives the base
price, the traveller pays base + commission as the total. The rate is
configurable per listing, supplier, or category (see `docs/database.md`),
not hardcoded — the global default used in the demo seed is 12%, chosen
as an illustrative figure, not a claimed market rate.

Future (not MVP) revenue streams: featured/sponsored listings, supplier
subscriptions, package margins, advertising.

## Distribution model
```
SUPPLIER → OUTHOOD → CUSTOMER
```
Outhood does not own inventory; it curates (verification), transacts
(booking + commission), and owns the customer-facing UX. Marketing
channels (SEO, social, direct, referral, partner) sit around this core
loop rather than inside the transaction path.

## Booking confirmation model — product decision
The MVP defaults every listing to **instant confirmation**
(`Listing.instantConfirm = true`): a booking is CONFIRMED as soon as the
customer submits it, rather than sitting in PENDING awaiting supplier
action. This was chosen deliberately for a simpler, less frustrating demo
flow. The underlying booking state machine still supports the full
PENDING → CONFIRMED/REJECTED request-to-book flow (this is closer to how
safari/tour bookings work in reality), and can be switched on per listing
without any schema change — see `docs/booking-workflow.md`.

## Disclaimer
This is a university simulation. Demo suppliers, listings, and reviews
are clearly labelled as such (`isSeedData` flags) and are not real
commercial partnerships. Commission rates, cancellation policies, and any
compliance-adjacent copy in this project are illustrative and marked
`TO BE VERIFIED` where a real regulatory or legal fact would be required
before commercial launch.
