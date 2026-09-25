import { describe, it, expect } from "vitest";
import { assertValidTransition, canTransition, InvalidBookingTransitionError } from "@/server/services/bookingStateMachine";

describe("booking state machine", () => {
  it("allows PENDING -> CONFIRMED", () => {
    expect(() => assertValidTransition("PENDING", "CONFIRMED")).not.toThrow();
  });

  it("allows CONFIRMED -> COMPLETED", () => {
    expect(() => assertValidTransition("CONFIRMED", "COMPLETED")).not.toThrow();
  });

  it("rejects COMPLETED -> PENDING", () => {
    expect(() => assertValidTransition("COMPLETED", "PENDING")).toThrow(InvalidBookingTransitionError);
  });

  it("rejects transitions out of terminal states", () => {
    expect(canTransition("REJECTED", "CONFIRMED")).toBe(false);
    expect(canTransition("CANCELLED", "PENDING")).toBe(false);
    expect(canTransition("REFUNDED", "CONFIRMED")).toBe(false);
  });

  it("allows a denied refund request to fall back to CONFIRMED", () => {
    expect(canTransition("REFUND_REQUESTED", "CONFIRMED")).toBe(true);
  });
});
