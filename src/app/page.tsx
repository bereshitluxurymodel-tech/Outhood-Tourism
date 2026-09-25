import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchListings } from "@/server/services/listingSearch";
import { ListingCard } from "@/components/ListingCard";

const categories = [
  { name: "Stays", note: "Lodges, camps & guesthouses", href: "/search?type=ACCOMMODATION" },
  { name: "Safaris", note: "Multi-day wildlife journeys", href: "/search?type=TOUR_PACKAGE" },
  { name: "Adventures", note: "Hikes, water & adrenaline", href: "/search?type=EXPERIENCE" },
  { name: "Experiences", note: "Half-day & single activities", href: "/search?type=EXPERIENCE" },
  { name: "Weekend getaways", note: "Close to Nairobi", href: "/search" },
];

const steps = [
  { title: "Discover", body: "Browse verified stays and experiences across Kenya, organised by destination." },
  { title: "Compare", body: "See real pricing, availability, and supplier ratings side by side." },
  { title: "Book", body: "Reserve directly — Outhood handles the transaction and the paper trail." },
  { title: "Travel", body: "Get your confirmation and itinerary, then go." },
];

export default async function HomePage() {
  // Real data, not hardcoded — pulled the same way /search and
  // /destinations/[name] pull it, so this section moves as suppliers and
  // destinations are added.
  const [destinations, featuredListings] = await Promise.all([
    prisma.destination.findMany({ take: 4, orderBy: { createdAt: "asc" } }),
    searchListings({}).then((listings) => listings.slice(0, 3)),
  ]);

  return (
    <main>
      {/* Hero — real photo background, dark gradient overlay for legible
          text in both themes. Photo: Wikimedia Commons (Maasai Mara). */}
      <section className="relative overflow-hidden border-b border-sandDeep px-6 py-24 dark:border-nightBorder md:py-32">
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Maasai-Mara-Typical-Scenery.JPG?width=1600"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/80" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-savanna">Kenya, curated</p>
          <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
            Discover Kenya. Book the experience.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Verified stays, safaris, and experiences from independent Kenyan
            suppliers — compared and booked in one place.
          </p>
        </div>

        {/* Search bar — real GET form, submits straight to /search with the
            destination as a query param so filters actually work end to end. */}
        <form
          action="/search"
          method="GET"
          className="relative mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-card border border-sandDeep bg-white p-3 shadow-lg dark:border-nightBorder dark:bg-nightCard md:flex-row md:items-center"
        >
          <input
            type="text"
            name="destination"
            placeholder="Where in Kenya?"
            className="flex-1 rounded-md border border-transparent bg-transparent px-4 py-3 text-ink outline-none focus:border-savanna dark:text-nightInk"
          />
          <input
            type="date"
            name="date"
            className="rounded-md border border-sandDeep bg-transparent px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:text-nightInk"
          />
          <input
            type="number"
            name="travellers"
            min={1}
            defaultValue={2}
            placeholder="Travellers"
            className="w-full rounded-md border border-sandDeep bg-transparent px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:text-nightInk md:w-32"
          />
          <button
            type="submit"
            className="rounded-md bg-savanna px-6 py-3 font-medium text-white transition-colors hover:bg-savannaDark"
          >
            Search
          </button>
        </form>
        <p className="relative mt-3 text-center text-xs text-white/50">Photo: Wikimedia Commons</p>
      </section>

      {/* Categories */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl text-ink dark:text-nightInk">Browse by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                className="rounded-card border border-sandDeep bg-white p-4 transition-shadow hover:shadow-md dark:border-nightBorder dark:bg-nightCard"
              >
                <p className="font-medium text-ink dark:text-nightInk">{c.name}</p>
                <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">{c.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured destinations — real data from the database */}
      {destinations.length > 0 && (
        <section className="border-t border-sandDeep bg-white px-6 py-16 dark:border-nightBorder dark:bg-nightCard">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl text-ink dark:text-nightInk">Featured destinations</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {destinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${encodeURIComponent(d.name)}`}
                  className="overflow-hidden rounded-card border border-sandDeep transition-shadow hover:shadow-md dark:border-nightBorder"
                >
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.name} loading="lazy" className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-savanna/25 to-acacia/25" />
                  )}
                  <div className="p-3">
                    <p className="font-medium text-ink dark:text-nightInk">{d.name}</p>
                    <p className="text-xs text-ink/50 dark:text-nightInk/50">{d.region}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured listings — real data from the database */}
      {featuredListings.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl text-ink dark:text-nightInk">Featured experiences</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  destinationName={listing.destination.name}
              destinationImageUrl={listing.destination.imageUrl}
                  type={listing.type}
                  basePriceCents={listing.basePriceCents}
                  supplierName={listing.supplier.businessName}
                  supplierVerified={listing.supplier.verificationStatus === "VERIFIED"}
                  isSeedData={listing.isSeedData}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-t border-sandDeep bg-white px-6 py-16 dark:border-nightBorder dark:bg-nightCard">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl text-ink dark:text-nightInk">How it works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title}>
                <p className="text-sm text-savanna">{i + 1}</p>
                <p className="mt-1 font-medium text-ink dark:text-nightInk">{s.title}</p>
                <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-card border border-sandDeep bg-acacia/5 p-8 dark:border-nightBorder dark:bg-acacia/10">
          <h2 className="font-display text-2xl text-ink dark:text-nightInk">Booking with confidence</h2>
          <div className="mt-6 grid gap-6 text-sm text-ink/70 dark:text-nightInk/70 md:grid-cols-3">
            <p>Suppliers go through an administrative review before their listings go live.</p>
            <p>Prices shown are the full amount you pay — no surprise fees at checkout.</p>
            <p>Every booking is a real record you can view, and support if something goes wrong.</p>
          </div>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="border-t border-sandDeep bg-ink px-6 py-16 text-sand dark:border-nightBorder dark:bg-black/40">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl">Run a lodge, camp, or tour business?</h2>
            <p className="mt-2 text-sand/70">List your business on Outhood and reach travellers directly.</p>
          </div>
          <a
            href="/supplier/apply"
            className="whitespace-nowrap rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark"
          >
            List your travel business
          </a>
        </div>
      </section>
    </main>
  );
}
