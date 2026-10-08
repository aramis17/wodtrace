import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHT_UNIT,
  preferredWeightUnit,
  convertWeight,
  formatWeight,
  kgToLb,
  lbToKg,
  parseWeightInput,
  roundWeight,
} from "./units";

describe("weight conversion", () => {
  it("converts kg to lb", () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 2);
  });
  it("converts lb to kg", () => {
    expect(lbToKg(220.462)).toBeCloseTo(100, 2);
  });
  it("round-trips", () => {
    expect(convertWeight(convertWeight(80, "KG", "LB"), "LB", "KG")).toBeCloseTo(
      80,
      5,
    );
  });
  it("rounds to plate-friendly steps", () => {
    expect(roundWeight(102.3, "KG")).toBe(102.5);
    expect(roundWeight(225.4, "LB")).toBe(225);
  });
  it("formats", () => {
    expect(formatWeight(100, "KG")).toBe("100 kg");
  });
  it("parses input in lb to kg", () => {
    const kg = parseWeightInput("220.5", "LB");
    expect(kg).toBeCloseTo(100, 0);
  });
});

describe("preferredWeightUnit", () => {
  it("defaults to pounds", () => {
    expect(DEFAULT_WEIGHT_UNIT).toBe("LB");
    expect(preferredWeightUnit(null)).toBe("LB");
    expect(preferredWeightUnit({})).toBe("LB");
    expect(preferredWeightUnit({ weightUnit: "bogus" })).toBe("LB");
  });

  it("respects an explicit choice", () => {
    expect(preferredWeightUnit({ weightUnit: "KG" })).toBe("KG");
    expect(preferredWeightUnit({ weightUnit: "LB" })).toBe("LB");
  });
});
