"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@prisma/client";

const ACTIONS: Partial<Record<BookingStatus, { label: string; to: BookingStatus; primary?: boolean }[]>> = {
  PENDING: [
    { label: "Accept", to: "CONFIRMED", primary: true },
    { label: "Reject", to: "REJECTED" },
  ],
  CONFIRMED: [
    { label: "Mark completed", to: "COMPLETED", primary: true },
    { label: "Cancel", to: "CANCELLED" },
  ],
};

export function SupplierBookingActions({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = ACTIONS[status];
  if (!actions) return null;

  async function handle(to: BookingStatus) {
    setLoading(to);
    setError(null);
    const res = await fetch(`/api/supplier/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    setLoading(null);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.to}
          onClick={() => handle(a.to)}
          disabled={loading !== null}
          className={
            a.primary
              ? "rounded-md bg-savanna px-4 py-1.5 text-sm font-medium text-white hover:bg-savannaDark disabled:opacity-60"
              : "rounded-md border border-sandDeep px-4 py-1.5 text-sm text-ink hover:bg-sandDeep disabled:opacity-60 dark:border-nightBorder dark:text-nightInk dark:hover:bg-nightBorder"
          }
        >
          {loading === a.to ? "…" : a.label}
        </button>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
