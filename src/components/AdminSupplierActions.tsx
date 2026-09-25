"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSupplierActions({ supplierId, status }: { supplierId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status !== "PENDING") return null;

  async function act(next: "VERIFIED" | "REJECTED") {
    setLoading(next);
    setError(null);
    const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
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
      <button
        onClick={() => act("VERIFIED")}
        disabled={loading !== null}
        className="rounded-md bg-savanna px-4 py-1.5 text-sm font-medium text-white hover:bg-savannaDark disabled:opacity-60"
      >
        {loading === "VERIFIED" ? "…" : "Verify"}
      </button>
      <button
        onClick={() => act("REJECTED")}
        disabled={loading !== null}
        className="rounded-md border border-sandDeep px-4 py-1.5 text-sm text-ink hover:bg-sandDeep disabled:opacity-60 dark:border-nightBorder dark:text-nightInk dark:hover:bg-nightBorder"
      >
        {loading === "REJECTED" ? "…" : "Reject"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
