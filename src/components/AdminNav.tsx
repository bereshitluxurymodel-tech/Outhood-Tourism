import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="flex gap-4 border-b border-sandDeep pb-3 text-sm text-ink/60 dark:border-nightBorder dark:text-nightInk/60">
      <Link href="/admin/dashboard" className="hover:text-ink dark:hover:text-nightInk">
        Dashboard
      </Link>
      <Link href="/admin/suppliers" className="hover:text-ink dark:hover:text-nightInk">
        Suppliers
      </Link>
      <Link href="/admin/listings" className="hover:text-ink dark:hover:text-nightInk">
        Listings
      </Link>
      <Link href="/admin/bookings" className="hover:text-ink dark:hover:text-nightInk">
        Bookings
      </Link>
      <Link href="/admin/complaints" className="hover:text-ink dark:hover:text-nightInk">
        Complaints
      </Link>
    </nav>
  );
}
