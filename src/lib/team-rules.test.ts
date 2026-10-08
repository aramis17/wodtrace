import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  canAssignIndividually,
  canViewProgramming,
  generateJoinCode,
  normalizeJoinCode,
  rankLeaderboard,
  selectDaysForAthlete,
  weekKeys,
  type LeaderboardInput,
} from "./team-rules";

describe("team permissions", () => {
  const team = { ownerId: "owner" };

  it("lets the owner and active students view programming", () => {
    expect(canViewProgramming(team, "owner", null)).toBe(true);
    expect(canViewProgramming(team, "a1", { status: "ACTIVE" })).toBe(true);
  });

  it("hides programming from pending students and outsiders", () => {
    expect(canViewProgramming(team, "a1", { status: "PENDING" })).toBe(false);
    expect(canViewProgramming(team, "x", null)).toBe(false);
  });

  it("only allows individual programming for coach teams", () => {
    expect(canAssignIndividually("COACH")).toBe(true);
    expect(canAssignIndividually("BOX")).toBe(false);
  });
});

describe("join codes", () => {
  it("generates unambiguous uppercase codes", () => {
    expect(generateJoinCode()).toMatch(/^[2-9A-HJKMNP-Z]{6}$/);
  });

  it("normalizes user input", () => {
    expect(normalizeJoinCode(" ab-c 12x ")).toBe("ABC12X");
  });
});

describe("date keys", () => {
  it("adds days across month boundaries", () => {
    expect(addDaysToKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("builds a Monday-first week", () => {
    const week = weekKeys("2026-10-08"); // Thursday
    expect(week[0]).toBe("2026-10-05");
    expect(week[6]).toBe("2026-10-11");
    expect(weekKeys("2026-10-11")[0]).toBe("2026-10-05"); // Sunday
  });
});

describe("selectDaysForAthlete", () => {
  const published = new Date();
  const days = [
    { id: "team", assigneeId: null, publishedAt: published },
    { id: "mine", assigneeId: "me", publishedAt: published },
    { id: "other", assigneeId: "you", publishedAt: published },
    { id: "draft", assigneeId: null, publishedAt: null },
  ];

  it("keeps team days and my individual days, published only", () => {
    expect(selectDaysForAthlete(days, "me").map((d) => d.id)).toEqual([
      "team",
      "mine",
    ]);
  });
});

describe("rankLeaderboard", () => {
  const entry = (
    id: string,
    profileId: string,
    extra: Partial<LeaderboardInput>,
  ): LeaderboardInput => ({
    resultId: id,
    profileId,
    alias: profileId,
    scaling: "RX",
    performedAt: new Date("2026-10-05T10:00:00Z"),
    ...extra,
  });

  it("ranks time ascending and keeps each athlete's best", () => {
    const board = rankLeaderboard("TIME", [
      entry("1", "ana", { timeSeconds: 300 }),
      entry("2", "ana", { timeSeconds: 280 }),
      entry("3", "beto", { timeSeconds: 250 }),
      entry("4", "caro", { timeSeconds: 400, scaling: "SCALED" }),
    ]);
    expect(board.RX.map((r) => [r.profileId, r.timeSeconds, r.rank])).toEqual([
      ["beto", 250, 1],
      ["ana", 280, 2],
    ]);
    expect(board.SCALED.map((r) => r.profileId)).toEqual(["caro"]);
  });

  it("ranks AMRAP and weight descending", () => {
    const amrap = rankLeaderboard("AMRAP", [
      entry("1", "ana", { rounds: 12, extraReps: 3 }),
      entry("2", "beto", { rounds: 12, extraReps: 9 }),
    ]);
    expect(amrap.RX.map((r) => r.profileId)).toEqual(["beto", "ana"]);

    const weight = rankLeaderboard("WEIGHT", [
      entry("1", "ana", { weightKg: 100 }),
      entry("2", "beto", { weightKg: 80 }),
    ]);
    expect(weight.RX.map((r) => r.profileId)).toEqual(["ana", "beto"]);
  });

  it("breaks ties by who logged first", () => {
    const board = rankLeaderboard("TIME", [
      entry("1", "late", {
        timeSeconds: 300,
        performedAt: new Date("2026-10-05T12:00:00Z"),
      }),
      entry("2", "early", { timeSeconds: 300 }),
    ]);
    expect(board.RX.map((r) => r.profileId)).toEqual(["early", "late"]);
  });
});
