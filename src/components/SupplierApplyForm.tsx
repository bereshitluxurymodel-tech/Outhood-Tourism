"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SupplierApplyForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    category: "",
    location: "",
    description: "",
    websiteUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/supplier/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/supplier/dashboard");
    router.refresh();
  }

  const inputClass =
    "rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk";

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <input
        required
        placeholder="Business name"
        value={form.businessName}
        onChange={(e) => set("businessName", e.target.value)}
        className={inputClass}
      />
      <input
        required
        placeholder="Contact person"
        value={form.contactPerson}
        onChange={(e) => set("contactPerson", e.target.value)}
        className={inputClass}
      />
      <input
        required
        placeholder="Category (e.g. Lodge, Tour Operator, Activity Provider)"
        value={form.category}
        onChange={(e) => set("category", e.target.value)}
        className={inputClass}
      />
      <input
        required
        placeholder="Location"
        value={form.location}
        onChange={(e) => set("location", e.target.value)}
        className={inputClass}
      />
      <textarea
        required
        placeholder="Tell us about your business"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        rows={4}
        className={inputClass}
      />
      <input
        placeholder="Website or social link (optional)"
        value={form.websiteUrl}
        onChange={(e) => set("websiteUrl", e.target.value)}
        className={inputClass}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
      <p className="text-xs text-ink/50 dark:text-nightInk/50">
        Submitting gives you access to the supplier dashboard right away so you can set up your
        listings, but your account and listings won&apos;t be visible to travellers until an
        admin reviews and approves them.
      </p>
    </form>
  );
}
