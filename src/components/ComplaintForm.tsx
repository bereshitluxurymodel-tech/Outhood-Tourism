"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ComplaintForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, category, description, priority }),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <p className="mt-3 text-sm text-acacia dark:text-savanna">
        Your report has been submitted — our team will review it.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-sm text-ink/60 underline hover:text-ink dark:text-nightInk/60 dark:hover:text-nightInk"
      >
        Report an issue with this booking
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 rounded-card border border-sandDeep p-4 dark:border-nightBorder">
      <input
        required
        placeholder="Category (e.g. Cleanliness, No-show, Billing)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
      />
      <textarea
        required
        placeholder="What happened?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
        className="w-32 rounded-md border border-sandDeep bg-white px-3 py-2 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-savanna px-5 py-2 text-sm font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
