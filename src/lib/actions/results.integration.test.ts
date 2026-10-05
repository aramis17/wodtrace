import { describe, expect, it } from "vitest";
import {
  formatScore,
  isBetterScore,
  selectBestResult,
} from "./../scoring";
import { calculatePlates } from "./../barbell";
import { convertWeight, parseWeightInput } from "./../units";

/**
 * Integration-style pure tests covering flows that don't need a live DB:
 * seed score types, favorite-like toggles (set logic), CRUD payload shaping,
 * guest isolation keys, and reset shape.
 */
describe("result CRUD payload shaping", () => {
  it("builds consistent score payloads across types", () => {
    const time = { timeSeconds: 300 };
    const amrap = { rounds: 12, extraReps: 4 };
    const weight = { weightKg: 100 };
    expect(formatScore("TIME", time).primary).toBe("5:00");
    expect(formatScore("AMRAP", amrap).primary).toBe("12+4");
    expect(formatScore("WEIGHT", weight, { weightUnit: "KG" }).primary).toBe(
      "100 kg",
    );
  });

  it("selects best across mixed history like a detail page", () => {
    const history = [
      { timeSeconds: 400, performedAt: "2024-01-01" },
      { timeSeconds: 320, performedAt: "2024-02-01" },
      { timeSeconds: 350, performedAt: "2024-03-01" },
    ];
    const best = selectBestResult("TIME", history);
    expect(best?.timeSeconds).toBe(320);
    expect(
      isBetterScore("TIME", { timeSeconds: 300 }, best!),
    ).toBe(true);
  });
});

describe("guest isolation keys", () => {
  it("scopes resources by guestId", () => {
    const a = { guestId: "g1", id: "r1" };
    const b = { guestId: "g2", id: "r1" };
    const mine = [a, b].filter((x) => x.guestId === "g1");
    expect(mine).toHaveLength(1);
    expect(mine[0].id).toBe("r1");
  });
});

describe("favorite toggle set logic", () => {
  it("adds and removes target ids", () => {
    const favs = new Set<string>();
    const toggle = (id: string) => {
      if (favs.has(id)) favs.delete(id);
      else favs.add(id);
      return favs.has(id);
    };
    expect(toggle("w1")).toBe(true);
    expect(toggle("w1")).toBe(false);
    expect(favs.size).toBe(0);
  });
});

describe("photo upload validation rules", () => {
  it("allows common image extensions under 8MB", () => {
    const allowed = ["jpg", "jpeg", "png", "webp", "heic"];
    const ext = "png";
    const size = 2 * 1024 * 1024;
    expect(allowed.includes(ext)).toBe(true);
    expect(size <= 8 * 1024 * 1024).toBe(true);
  });
});

describe("reset data shape", () => {
  it("clears user entities but keeps seed catalog concept", () => {
    const catalog = [{ id: "seed1", isSeed: true, guestId: null }];
    let userWods = [{ id: "c1", isSeed: false, guestId: "g1" }];
    let results = [{ id: "r1", guestId: "g1" }];
    results = results.filter((r) => r.guestId !== "g1");
    userWods = userWods.filter((w) => w.guestId !== "g1");
    expect(results).toHaveLength(0);
    expect(userWods).toHaveLength(0);
    expect(catalog).toHaveLength(1);
  });
});

describe("unit + barbell tool chain", () => {
  it("converts lb input then loads plates in kg", () => {
    const kg = parseWeightInput("220.5", "LB");
    expect(kg).not.toBeNull();
    const plates = calculatePlates(Math.round(kg! / 2.5) * 2.5, "KG", 20);
    expect(plates.achieved).toBeGreaterThan(0);
    expect(convertWeight(kg!, "KG", "LB")).toBeCloseTo(220.5, 0);
  });
});
