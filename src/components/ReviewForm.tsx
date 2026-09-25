"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 rounded-card border border-sandDeep p-4 dark:border-nightBorder">
      <label className="text-sm font-medium text-ink dark:text-nightInk">Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-24 rounded-md border border-sandDeep bg-white px-3 py-2 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} / 5
          </option>
        ))}
      </select>
      <textarea
        required
        placeholder="How was your trip?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-savanna px-5 py-2 text-sm font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
