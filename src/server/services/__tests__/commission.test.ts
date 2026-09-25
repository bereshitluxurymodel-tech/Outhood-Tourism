import { describe, it, expect } from "vitest";
import { calculateCommission } from "@/server/services/commission";

describe("calculateCommission", () => {
  it("computes commission and total from base amount and rate", () => {
    const { commissionCents, totalAmountCents, supplierPayableCents } = calculateCommission(1_000_000, 12);
    expect(commissionCents).toBe(120_000);
    expect(totalAmountCents).toBe(1_120_000);
    expect(supplierPayableCents).toBe(1_000_000);
  });

  it("rounds commission to the nearest cent", () => {
    const { commissionCents } = calculateCommission(999, 12.5);
    expect(commissionCents).toBe(Math.round(999 * 0.125));
  });

  it("rejects negative base amounts", () => {
    expect(() => calculateCommission(-100, 10)).toThrow();
  });

  it("rejects negative rates", () => {
    expect(() => calculateCommission(100, -1)).toThrow();
  });

  it("handles a zero rate", () => {
    const { commissionCents, totalAmountCents } = calculateCommission(500, 0);
    expect(commissionCents).toBe(0);
    expect(totalAmountCents).toBe(500);
  });
});
