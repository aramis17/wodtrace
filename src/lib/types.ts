export type ScoreType = "TIME" | "REPS_TIME" | "WEIGHT" | "AMRAP" | "CUSTOM";
export type TimerMode = "AMRAP" | "EMOM" | "TABATA" | "FOR_TIME";
export type WeightUnit = "KG" | "LB";
export type ThemePreference = "DARK" | "LIGHT" | "SYSTEM";
export type Scaling = "RX" | "SCALED";
export type FavoriteTarget = "WORKOUT" | "PERSONAL_RECORD";
export type ActivityFilter = "all" | "wods" | "prs" | "standards";

export interface ScorePayload {
  timeSeconds?: number | null;
  reps?: number | null;
  weightKg?: number | null;
  rounds?: number | null;
  extraReps?: number | null;
  customValue?: string | null;
}

export interface FormattedScore {
  primary: string;
  secondary?: string;
  sortValue: number;
}

export const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  TIME: "Tiempo",
  REPS_TIME: "Reps y tiempo",
  WEIGHT: "Peso",
  AMRAP: "AMRAP",
  CUSTOM: "Personalizado",
};

export const TIMER_MODE_LABELS: Record<TimerMode, string> = {
  AMRAP: "AMRAP",
  EMOM: "EMOM",
  TABATA: "Tabata",
  FOR_TIME: "Por tiempo",
};

export const CATEGORY_SLUGS = [
  "girls",
  "heroes",
  "open",
  "bodyweight",
  "benchmarks",
  "custom",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
