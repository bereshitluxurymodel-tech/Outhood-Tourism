import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { OuthoodMark } from "@/components/OuthoodMark";

export async function SiteHeader() {
  const [session, destinations] = await Promise.all([
    getServerSession(authOptions),
    prisma.destination.findMany({ orderBy: { name: "asc" }, take: 8 }),
  ]);
  const user = session?.user as { name?: string | null; role?: string } | undefined;

  return (
    <header className="relative z-50 border-b border-sandDeep bg-white/80 backdrop-blur dark:border-nightBorder dark:bg-night/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-ink dark:text-nightInk">
          <OuthoodMark className="h-8 w-8 shrink-0 rounded-full" />
          Outhood
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink/70 dark:text-nightInk/70">
          <Link href="/search" className="hover:text-ink dark:hover:text-nightInk">
            Browse
          </Link>

          {/* Destinations, visible directly in the nav rather than buried
              inside the homepage — a CSS-only hover dropdown (no JS
              needed) listing every seeded destination as a direct link. */}
          {destinations.length > 0 && (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-ink dark:hover:text-nightInk"
              >
                Destinations
                <svg width="10" height="10" viewBox="0 0 10 10" className="mt-px" aria-hidden>
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full z-10 mt-2 w-48 rounded-card border border-sandDeep bg-white py-2 opacity-0 shadow-md transition-opacity group-hover:visible group-hover:opacity-100 dark:border-nightBorder dark:bg-nightCard">
                {destinations.map((d) => (
                  <Link
                    key={d.id}
                    href={`/destinations/${encodeURIComponent(d.name)}`}
                    className="block px-4 py-2 text-ink/80 hover:bg-sand hover:text-ink dark:text-nightInk/80 dark:hover:bg-nightBorder dark:hover:text-nightInk"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Once logged in as a supplier (or admin), this is the only way
              to reach the portal — without it, the dashboard was only
              reachable by typing the URL directly. */}
          {user && (
            <Link href="/dashboard" className="hover:text-ink dark:hover:text-nightInk">
              My bookings
            </Link>
          )}
          {user && (user.role === "SUPPLIER" || user.role === "ADMIN") && (
            <Link href="/supplier/dashboard" className="hover:text-ink dark:hover:text-nightInk">
              My business
            </Link>
          )}
          {user && user.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="hover:text-ink dark:hover:text-nightInk">
              Admin
            </Link>
          )}
          {!user && (
            <Link href="/supplier/apply" className="hover:text-ink dark:hover:text-nightInk">
              List your business
            </Link>
          )}

          {user ? (
            <>
              <span className="text-ink/50 dark:text-nightInk/50">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="hover:text-ink dark:hover:text-nightInk">
              Log in
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
