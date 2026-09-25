"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Destination = { id: string; name: string };

type ListingFormValues = {
  destinationId: string;
  type: "ACCOMMODATION" | "EXPERIENCE" | "TOUR_PACKAGE";
  title: string;
  description: string;
  basePriceCents: number;
  cancellationPolicy: string;
  instantConfirm: boolean;
};

type Props = {
  destinations: Destination[];
  initial?: ListingFormValues;
  listingId?: string; // present when editing
};

const inputClass =
  "rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk";

export function ListingForm({ destinations, initial, listingId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ListingFormValues>(
    initial ?? {
      destinationId: destinations[0]?.id ?? "",
      type: "ACCOMMODATION",
      title: "",
      description: "",
      basePriceCents: 0,
      cancellationPolicy: "",
      instantConfirm: true,
    }
  );
  const [priceKes, setPriceKes] = useState(initial ? String(initial.basePriceCents / 100) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const basePriceCents = Math.round(parseFloat(priceKes || "0") * 100);
    if (!basePriceCents || basePriceCents <= 0) {
      setError("Enter a valid price.");
      return;
    }

    setSubmitting(true);
    const url = listingId ? `/api/supplier/listings/${listingId}` : "/api/supplier/listings";
    const method = listingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, basePriceCents }),
    });
    setSubmitting(false);

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/supplier/listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <select
        value={form.destinationId}
        onChange={(e) => set("destinationId", e.target.value)}
        className={inputClass}
      >
        {destinations.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        value={form.type}
        onChange={(e) => set("type", e.target.value as ListingFormValues["type"])}
        className={inputClass}
      >
        <option value="ACCOMMODATION">Accommodation</option>
        <option value="EXPERIENCE">Experience</option>
        <option value="TOUR_PACKAGE">Tour package</option>
      </select>

      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        className={inputClass}
      />
      <textarea
        required
        placeholder="Description"
        rows={4}
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        className={inputClass}
      />
      <input
        required
        type="number"
        min="1"
        step="1"
        placeholder="Price per traveller (KSh)"
        value={priceKes}
        onChange={(e) => setPriceKes(e.target.value)}
        className={inputClass}
      />
      <input
        required
        placeholder="Cancellation policy"
        value={form.cancellationPolicy}
        onChange={(e) => set("cancellationPolicy", e.target.value)}
        className={inputClass}
      />
      <label className="flex items-center gap-2 text-sm text-ink dark:text-nightInk">
        <input
          type="checkbox"
          checked={form.instantConfirm}
          onChange={(e) => set("instantConfirm", e.target.checked)}
        />
        Instantly confirm bookings (uncheck to review each booking request yourself)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {submitting ? "Saving…" : listingId ? "Save changes" : "Create listing"}
      </button>
      <p className="text-xs text-ink/50 dark:text-nightInk/50">
        {listingId
          ? "Editing a live listing sends it back for admin review before it's visible to travellers again."
          : "New listings are reviewed by an admin before they appear in search."}
      </p>
    </form>
  );
}
