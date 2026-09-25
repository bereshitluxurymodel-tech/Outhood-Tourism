"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayNowButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(outcome: "PAID" | "FAILED") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/payments/${paymentId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not update payment status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-sm text-ink/60 dark:text-nightInk/60">
        This is a mock payment for the demo — no real money moves. Choose an outcome to simulate
        the gateway response:
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => pay("PAID")}
          className="rounded-md bg-savanna px-5 py-2 text-sm font-medium text-white hover:bg-savannaDark disabled:opacity-60"
        >
          Simulate successful payment
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => pay("FAILED")}
          className="rounded-md border border-sandDeep px-5 py-2 text-sm font-medium text-ink hover:bg-sandDeep dark:border-nightBorder dark:text-nightInk"
        >
          Simulate failed payment
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
