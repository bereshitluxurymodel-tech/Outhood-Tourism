import Link from "next/link";

export function SupplierNav() {
  return (
    <nav className="flex gap-4 border-b border-sandDeep pb-3 text-sm text-ink/60 dark:border-nightBorder dark:text-nightInk/60">
      <Link href="/supplier/dashboard" className="hover:text-ink dark:hover:text-nightInk">
        Dashboard
      </Link>
      <Link href="/supplier/listings" className="hover:text-ink dark:hover:text-nightInk">
        Listings
      </Link>
      <Link href="/supplier/bookings" className="hover:text-ink dark:hover:text-nightInk">
        Bookings
      </Link>
    </nav>
  );
}
