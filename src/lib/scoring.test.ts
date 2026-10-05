import { describe, expect, it } from "vitest";
import {
  formatScore,
  formatSeconds,
  isBetterScore,
  parseTimeToSeconds,
  scoreSortValue,
  selectBestResult,
} from "./scoring";

describe("parseTimeToSeconds", () => {
  it("parses mm:ss", () => {
    expect(parseTimeToSeconds("5:30")).toBe(330);
    expect(parseTimeToSeconds("0:45")).toBe(45);
  });
  it("parses hh:mm:ss", () => {
    expect(parseTimeToSeconds("1:02:03")).toBe(3723);
  });
  it("parses plain seconds", () => {
    expect(parseTimeToSeconds("90")).toBe(90);
  });
  it("rejects invalid", () => {
    expect(parseTimeToSeconds("5:99")).toBeNull();
    expect(parseTimeToSeconds("")).toBeNull();
  });
});

describe("formatSeconds", () => {
  it("formats under an hour", () => {
    expect(formatSeconds(330)).toBe("5:30");
  });
  it("formats with hours", () => {
    expect(formatSeconds(3723)).toBe("1:02:03");
  });
});

describe("best result selection", () => {
  it("picks lowest time", () => {
    const best = selectBestResult("TIME", [
      { timeSeconds: 400 },
      { timeSeconds: 300 },
      { timeSeconds: 350 },
    ]);
    expect(best?.timeSeconds).toBe(300);
  });

  it("picks highest weight", () => {
    const best = selectBestResult("WEIGHT", [
      { weightKg: 100 },
      { weightKg: 140 },
      { weightKg: 120 },
    ]);
    expect(best?.weightKg).toBe(140);
  });

  it("picks highest AMRAP rounds+reps", () => {
    const best = selectBestResult("AMRAP", [
      { rounds: 10, extraReps: 5 },
      { rounds: 11, extraReps: 0 },
      { rounds: 10, extraReps: 8 },
    ]);
    expect(best).toEqual({ rounds: 11, extraReps: 0 });
  });

  it("picks highest AMRAP reps when rounds missing (PR attempts)", () => {
    const best = selectBestResult("AMRAP", [
      { reps: 10 },
      { reps: 18 },
      { reps: 15 },
    ]);
    expect(best).toEqual({ reps: 18 });
  });

  it("REPS_TIME prefers more reps then less time", () => {
    expect(
      isBetterScore(
        "REPS_TIME",
        { reps: 100, timeSeconds: 600 },
        { reps: 90, timeSeconds: 500 },
      ),
    ).toBe(true);
    expect(
      isBetterScore(
        "REPS_TIME",
        { reps: 100, timeSeconds: 500 },
        { reps: 100, timeSeconds: 600 },
      ),
    ).toBe(true);
  });
});

describe("formatScore", () => {
  it("formats weight in lb", () => {
    const s = formatScore("WEIGHT", { weightKg: 100 }, { weightUnit: "LB" });
    expect(s.primary).toContain("lb");
    expect(parseFloat(s.primary)).toBeCloseTo(220.5, 0);
  });

  it("formats AMRAP with extras", () => {
    expect(
      formatScore("AMRAP", { rounds: 12, extraReps: 3 }).primary,
    ).toBe("12+3");
  });

  it("formats AMRAP reps when rounds missing (PR attempts)", () => {
    const s = formatScore("AMRAP", { reps: 18 });
    expect(s.primary).toBe("18");
    expect(s.secondary).toBe("reps");
  });
});

describe("scoreSortValue", () => {
  it("uses infinity for missing time", () => {
    expect(scoreSortValue("TIME", {})).toBe(Number.POSITIVE_INFINITY);
  });
});
