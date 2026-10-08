import { randomInt } from "crypto";
import { scoreSortValue } from "./scoring";
import type { ScorePayload, ScoreType, Scaling } from "./types";

export type TeamKind = "COACH" | "BOX";
export type MemberStatus = "PENDING" | "ACTIVE";
export type BlockKind = "WARMUP" | "STRENGTH" | "WOD" | "ACCESSORY" | "OTHER";

export const TEAM_KIND_LABELS: Record<TeamKind, string> = {
  COACH: "Coach",
  BOX: "Box",
};

export const BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  WARMUP: "Calentamiento",
  STRENGTH: "Fuerza",
  WOD: "WOD",
  ACCESSORY: "Accesorio",
  OTHER: "Otro",
};

/** Only coaches program for a single athlete; a box programs the day for every student. */
export function canAssignIndividually(kind: TeamKind): boolean {
  return kind === "COACH";
}

export function isTeamOwner(team: { ownerId: string }, profileId: string) {
  return team.ownerId === profileId;
}

/** Owners see everything; students only see programming once approved. */
export function canViewProgramming(
  team: { ownerId: string },
  profileId: string,
  membership: { status: MemberStatus } | null,
) {
  return isTeamOwner(team, profileId) || membership?.status === "ACTIVE";
}

// No 0/O/1/I/L so codes can be read aloud and typed on a phone.
const JOIN_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateJoinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += JOIN_ALPHABET[randomInt(JOIN_ALPHABET.length)];
  }
  return code;
}

export function normalizeJoinCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Programming days are stored as Postgres DATE (UTC midnight); keys are "YYYY-MM-DD". */
export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function dateKeyToDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function dateToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's calendar date in APP_TIME_ZONE (falls back to the server's zone). */
export function todayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIME_ZONE || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDaysToKey(key: string, days: number): string {
  const d = dateKeyToDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToKey(d);
}

/** Monday-first week containing `key`. */
export function weekKeys(key: string): string[] {
  const d = dateKeyToDate(key);
  const offset = (d.getUTCDay() + 6) % 7;
  const monday = addDaysToKey(key, -offset);
  return Array.from({ length: 7 }, (_, i) => addDaysToKey(monday, i));
}

export function formatDateKeyEs(
  key: string,
  opts?: Intl.DateTimeFormatOptions,
) {
  return dateKeyToDate(key).toLocaleDateString("es-ES", {
    timeZone: "UTC",
    ...(opts ?? { weekday: "long", day: "numeric", month: "long" }),
  });
}

/** Team-wide days plus the ones assigned to this athlete, published only. */
export function selectDaysForAthlete<
  T extends { assigneeId: string | null; publishedAt: Date | null },
>(days: T[], profileId: string): T[] {
  return days.filter(
    (d) =>
      d.publishedAt != null &&
      (d.assigneeId == null || d.assigneeId === profileId),
  );
}

export interface LeaderboardInput extends ScorePayload {
  profileId: string;
  alias: string;
  scaling: Scaling;
  performedAt: Date;
  resultId: string;
}

export interface LeaderboardRow extends LeaderboardInput {
  rank: number;
}

/** Best result per athlete, ranked within each scaling. Ties go to whoever logged first. */
export function rankLeaderboard(
  scoreType: ScoreType,
  entries: LeaderboardInput[],
): Record<Scaling, LeaderboardRow[]> {
  const lowerIsBetter = scoreType === "TIME";
  const compare = (a: LeaderboardInput, b: LeaderboardInput) => {
    const av = scoreSortValue(scoreType, a);
    const bv = scoreSortValue(scoreType, b);
    if (av !== bv) return lowerIsBetter ? av - bv : bv - av;
    return a.performedAt.getTime() - b.performedAt.getTime();
  };

  const out: Record<Scaling, LeaderboardRow[]> = { RX: [], SCALED: [] };
  for (const scaling of ["RX", "SCALED"] as const) {
    const best = new Map<string, LeaderboardInput>();
    for (const e of entries) {
      if (e.scaling !== scaling) continue;
      const cur = best.get(e.profileId);
      if (!cur || compare(e, cur) < 0) best.set(e.profileId, e);
    }
    out[scaling] = [...best.values()]
      .sort(compare)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }
  return out;
}
