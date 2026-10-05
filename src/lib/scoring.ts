import type { FormattedScore, ScorePayload, ScoreType } from "./types";

export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.round(parseFloat(trimmed));
  }

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) return null;

  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if (s >= 60) return null;
    return Math.round(m * 60 + s);
  }

  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    if (m >= 60 || s >= 60) return null;
    return Math.round(h * 3600 + m * 60 + s);
  }

  return null;
}

export function formatSeconds(total: number | null | undefined): string {
  if (total == null || Number.isNaN(total) || total < 0) return "—";
  const s = Math.round(total);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Lower is better for TIME; higher is better otherwise. */
export function scoreSortValue(
  scoreType: ScoreType,
  payload: ScorePayload,
): number {
  switch (scoreType) {
    case "TIME":
      return payload.timeSeconds ?? Number.POSITIVE_INFINITY;
    case "REPS_TIME": {
      const reps = payload.reps ?? 0;
      const time = payload.timeSeconds ?? 0;
      return reps * 1_000_000 - time;
    }
    case "WEIGHT":
      return payload.weightKg ?? Number.NEGATIVE_INFINITY;
    case "AMRAP": {
      const rounds = payload.rounds;
      const extra = payload.extraReps ?? 0;
      if (rounds == null) return payload.reps ?? 0;
      return rounds * 1000 + extra;
    }
    case "CUSTOM": {
      const n = Number(payload.customValue);
      return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
    }
    default:
      return Number.NEGATIVE_INFINITY;
  }
}

export function isBetterScore(
  scoreType: ScoreType,
  candidate: ScorePayload,
  currentBest: ScorePayload,
): boolean {
  const a = scoreSortValue(scoreType, candidate);
  const b = scoreSortValue(scoreType, currentBest);
  if (scoreType === "TIME") return a < b;
  return a > b;
}

export function selectBestResult<T extends ScorePayload>(
  scoreType: ScoreType,
  results: T[],
): T | null {
  if (results.length === 0) return null;
  return results.reduce((best, cur) =>
    isBetterScore(scoreType, cur, best) ? cur : best,
  );
}

export function formatScore(
  scoreType: ScoreType,
  payload: ScorePayload,
  opts?: { weightUnit?: "KG" | "LB"; weightLabel?: string },
): FormattedScore {
  const unit = opts?.weightUnit ?? "KG";
  switch (scoreType) {
    case "TIME":
      return {
        primary: formatSeconds(payload.timeSeconds),
        sortValue: scoreSortValue(scoreType, payload),
      };
    case "REPS_TIME":
      return {
        primary: `${payload.reps ?? 0} reps`,
        secondary: formatSeconds(payload.timeSeconds),
        sortValue: scoreSortValue(scoreType, payload),
      };
    case "WEIGHT": {
      const kg = payload.weightKg ?? 0;
      const value = unit === "LB" ? kg * 2.2046226218 : kg;
      const label = opts?.weightLabel ?? (unit === "LB" ? "lb" : "kg");
      const rounded = Math.round(value * 10) / 10;
      return {
        primary: `${rounded} ${label}`,
        sortValue: scoreSortValue(scoreType, payload),
      };
    }
    case "AMRAP": {
      const rounds = payload.rounds;
      const extra = payload.extraReps ?? 0;
      if (rounds == null) {
        const reps = payload.reps ?? 0;
        return {
          primary: `${reps}`,
          secondary: "reps",
          sortValue: reps,
        };
      }
      return {
        primary: extra > 0 ? `${rounds}+${extra}` : `${rounds}`,
        secondary: "rondas",
        sortValue: scoreSortValue(scoreType, payload),
      };
    }
    case "CUSTOM":
      return {
        primary: payload.customValue?.trim() || "—",
        sortValue: scoreSortValue(scoreType, payload),
      };
    default:
      return { primary: "—", sortValue: 0 };
  }
}
