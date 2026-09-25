"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatKes } from "@/lib/format";

type Props = {
  listingId: string;
  title: string;
  basePriceCents: number;
};

export function BookingForm({ listingId, title, basePriceCents }: Props) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [travellerNames, setTravellerNames] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Generated once per visit to this form and reused on every retry, so a
  // double-click or a retried request can't create two bookings — the
  // server-side idempotency key check relies on this staying the same.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  function updateTravellerCount(count: number) {
    const safeCount = Math.max(1, count);
    setTravellerCount(safeCount);
    setTravellerNames((prev) => {
      const next = [...prev];
      while (next.length < safeCount) next.push("");
      return next.slice(0, safeCount);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate) {
      setError("Please choose a travel date.");
      return;
    }
    if (travellerNames.some((n) => !n.trim())) {
      setError("Please enter a name for every traveller.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        startDate,
        travellerCount,
        travellers: travellerNames.map((fullName) => ({ fullName })),
        idempotencyKey,
      }),
    });
    setSubmitting(false);

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push(`/booking/confirmation/${data.reference}?paymentId=${data.paymentId}`);
  }

  const totalCents = basePriceCents * travellerCount; // commission is added server-side; this is a preview only

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-ink dark:text-nightInk">Travel date</label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink dark:text-nightInk">Number of travellers</label>
        <input
          type="number"
          min={1}
          required
          value={travellerCount}
          onChange={(e) => updateTravellerCount(Number(e.target.value))}
          className="mt-1 w-32 rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-ink dark:text-nightInk">Traveller names</label>
        {travellerNames.map((name, i) => (
          <input
            key={i}
            type="text"
            required
            placeholder={`Traveller ${i + 1} full name`}
            value={name}
            onChange={(e) => {
              const next = [...travellerNames];
              next[i] = e.target.value;
              setTravellerNames(next);
            }}
            className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
          />
        ))}
      </div>

      <div className="rounded-card border border-sandDeep bg-white p-4 dark:border-nightBorder dark:bg-nightCard">
        <div className="flex justify-between text-sm text-ink/70 dark:text-nightInk/70">
          <span>{title}</span>
          <span>{formatKes(basePriceCents)} × {travellerCount}</span>
        </div>
        <div className="mt-2 flex justify-between font-medium text-ink dark:text-nightInk">
          <span>Estimated total</span>
          <span>{formatKes(totalCents)}</span>
        </div>
        <p className="mt-1 text-xs text-ink/50 dark:text-nightInk/50">
          Final total (including Outhood&apos;s service fee) is confirmed on the next step.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {submitting ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
