import { describe, expect, it } from "vitest";
import { calculatePlates, estimateOneRepMax } from "./barbell";

describe("calculatePlates", () => {
  it("loads 100 kg with 20 kg bar", () => {
    const r = calculatePlates(100, "KG", 20);
    expect(r.achieved).toBe(100);
    expect(r.perSide).toEqual([
      { weight: 25, countPerSide: 1 },
      { weight: 15, countPerSide: 1 },
    ]);
    expect(r.remainder).toBe(0);
  });

  it("handles target equal to bar", () => {
    const r = calculatePlates(20, "KG", 20);
    expect(r.perSide).toEqual([]);
    expect(r.achieved).toBe(20);
  });

  it("reports remainder when not exact (ceil up)", () => {
    const r = calculatePlates(103, "KG", 20, [25, 20, 15, 10, 5, 2.5]);
    expect(r.achieved).toBeGreaterThanOrEqual(103);
    expect(r.remainder).toBeGreaterThanOrEqual(0);
  });

  it("works in pounds", () => {
    const r = calculatePlates(225, "LB", 45);
    expect(r.achieved).toBe(225);
    expect(r.perSide.length).toBeGreaterThan(0);
  });

  it("rounds up to nearest loadable (236 lb -> 240)", () => {
    const pairs = { 45: 5, 35: 5, 25: 5, 15: 5, 10: 5, 5: 5, 2.5: 5, 55: 0, 1.25: 0, 1: 0 } as Record<number, number>;
    const r = calculatePlates(236, "LB", 45, pairs);
    expect(r.achieved).toBe(240);
    expect(r.remainder).toBe(4);
    expect(r.perSide.some((p) => p.weight === 45 && p.countPerSide === 2)).toBe(true);
  });

  it("rounds 203 lb up to 205 lb", () => {
    const pairs = { 45: 5, 35: 5, 25: 5, 15: 5, 10: 5, 5: 5, 2.5: 5, 55: 0, 1.25: 0, 1: 0 } as Record<number, number>;
    const r = calculatePlates(203, "LB", 45, pairs);
    expect(r.achieved).toBe(205);
    expect(r.achieved).toBeGreaterThanOrEqual(203);
  });

  it("fallback unlimited still ceils when no pairs provided", () => {
    const r = calculatePlates(236, "LB", 45);
    expect(r.achieved).toBeGreaterThanOrEqual(236);
  });

  it("uses extra inventory plates like 55 and 15 lb", () => {
    const pairs = { 55: 2, 45: 0, 35: 0, 25: 0, 15: 2, 10: 0, 5: 0, 2.5: 0, 1.25: 0, 1: 0 };
    const r = calculatePlates(155, "LB", 45, pairs);
    expect(r.achieved).toBe(155);
    expect(r.perSide.some((p) => p.weight === 55 && p.countPerSide === 1)).toBe(true);
  });

  it("respects zero pairs for a plate type", () => {
    const pairsZero45 = { 45: 0, 35: 5, 25: 5, 10: 5, 5: 5, 2.5: 5 } as Record<number, number>;
    const r = calculatePlates(225, "LB", 45, pairsZero45);
    expect(r.perSide.every((p) => p.weight !== 45)).toBe(true);
    expect(r.achieved).toBeGreaterThanOrEqual(225);
  });
});

describe("estimateOneRepMax", () => {
  it("225x1 = 225 (epley)", () => {
    expect(estimateOneRepMax(225, 1)).toBe(225);
  });
  it("100x5 ~116.7 (epley)", () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(116.666, 1);
  });
  it("returns null for invalid inputs", () => {
    expect(estimateOneRepMax(0, 5)).toBeNull();
    expect(estimateOneRepMax(-10, 5)).toBeNull();
    expect(estimateOneRepMax(NaN, 5)).toBeNull();
    expect(estimateOneRepMax(100, 0)).toBeNull();
    expect(estimateOneRepMax(100, NaN)).toBeNull();
  });
  it("clamps reps to 1..30 and rounds", () => {
    expect(estimateOneRepMax(100, 100)).toBe(200); // 30 clamp => 100*2
    expect(estimateOneRepMax(100, 5.6)).toBeCloseTo(120, 5); // round 6 => 100*1.2
  });
});
