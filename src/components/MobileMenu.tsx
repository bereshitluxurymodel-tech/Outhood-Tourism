"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

type Props = {
  user: { name?: string | null; role?: string } | null;
  destinations: { id: string; name: string }[];
};

export function MobileMenu({ user, destinations }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkClass =
    "block rounded-md px-3 py-3 text-base text-ink hover:bg-sand dark:text-nightInk dark:hover:bg-nightCard";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-sandDeep text-ink dark:border-nightBorder dark:text-nightInk"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          {open ? (
            <path d="M4 4l12 12M16 4L4 16" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full max-h-[80vh] overflow-y-auto border-b border-sandDeep bg-white px-4 pb-4 pt-2 shadow-lg dark:border-nightBorder dark:bg-night">
          <Link href="/search" onClick={close} className={linkClass}>
            Browse
          </Link>

          {destinations.length > 0 && (
            <div className="mt-1">
              <p className="px-3 pt-2 text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-nightInk/50">
                Destinations
              </p>
              {destinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${encodeURIComponent(d.name)}`}
                  onClick={close}
                  className={linkClass}
                >
                  {d.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-2 border-t border-sandDeep pt-2 dark:border-nightBorder">
            {user && (
              <Link href="/dashboard" onClick={close} className={linkClass}>
                My bookings
              </Link>
            )}
            {user && (user.role === "SUPPLIER" || user.role === "ADMIN") && (
              <Link href="/supplier/dashboard" onClick={close} className={linkClass}>
                My business
              </Link>
            )}
            {user && user.role === "ADMIN" && (
              <Link href="/admin/dashboard" onClick={close} className={linkClass}>
                Admin
              </Link>
            )}
            {(!user || user.role === "CUSTOMER") && (
              <Link href="/supplier/apply" onClick={close} className={linkClass}>
                List your business
              </Link>
            )}

            {user ? (
              <div className="flex items-center justify-between px-3 py-3 text-base text-ink dark:text-nightInk">
                <span className="text-ink/60 dark:text-nightInk/60">{user.name}</span>
                <LogoutButton />
              </div>
            ) : (
              <div className="mt-2 flex gap-2 px-1">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex-1 rounded-md border border-sandDeep px-4 py-3 text-center text-base text-ink dark:border-nightBorder dark:text-nightInk"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="flex-1 rounded-md bg-savanna px-4 py-3 text-center text-base font-medium text-white hover:bg-savannaDark"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
