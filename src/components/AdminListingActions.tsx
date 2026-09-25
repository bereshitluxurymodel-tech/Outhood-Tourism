"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminListingActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions: { label: string; to: "APPROVED" | "REJECTED" | "INACTIVE" }[] =
    status === "PENDING_APPROVAL"
      ? [
          { label: "Approve", to: "APPROVED" },
          { label: "Reject", to: "REJECTED" },
        ]
      : status === "APPROVED"
        ? [{ label: "Deactivate", to: "INACTIVE" }]
        : status === "INACTIVE"
          ? [{ label: "Reactivate", to: "APPROVED" }]
          : [];

  if (actions.length === 0) return null;

  async function act(to: "APPROVED" | "REJECTED" | "INACTIVE") {
    setLoading(to);
    setError(null);
    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      {actions.map((a, i) => (
        <button
          key={a.to}
          onClick={() => act(a.to)}
          disabled={loading !== null}
          className={
            i === 0
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
