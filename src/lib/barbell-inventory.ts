import type { WeightUnit } from "./units";
import { DEFAULT_BAR_KG, DEFAULT_BAR_LB } from "./barbell";

export const DEFAULT_INCREMENT = 5 as const;
export type IncrementOption = 1 | 2 | 5 | 10 | 15;

export const PLATE_INVENTORY_DEFAULTS_LB: Record<number, number> = {
  55: 0,
  45: 5,
  35: 5,
  25: 5,
  15: 5,
  10: 5,
  5: 5,
  2.5: 5,
  1.25: 0,
  1: 0,
};

export const PLATE_INVENTORY_DEFAULTS_KG: Record<number, number> = {
  25: 5,
  20: 5,
  15: 5,
  10: 5,
  5: 5,
  2.5: 5,
  1.25: 0,
  1: 0,
  0.5: 0,
};

export interface BarbellInventory {
  barWeight: number;
  platePairs: Record<number, number>;
  increment: IncrementOption;
}

function defaultsForUnit(unit: WeightUnit): BarbellInventory {
  return {
    barWeight: unit === "KG" ? DEFAULT_BAR_KG : DEFAULT_BAR_LB,
    platePairs:
      unit === "KG"
        ? { ...PLATE_INVENTORY_DEFAULTS_KG }
        : { ...PLATE_INVENTORY_DEFAULTS_LB },
    increment: DEFAULT_INCREMENT,
  };
}

export function getInventoryKey(guestId?: string): string {
  return guestId ? `barbell:inventory:v1:${guestId}` : "barbell:inventory:v1";
}

export function loadInventory(
  guestId?: string,
  unit: WeightUnit = "LB",
): BarbellInventory {
  const defaults = defaultsForUnit(unit);
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(getInventoryKey(guestId));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<BarbellInventory>;
    const barWeight =
      typeof parsed.barWeight === "number" && Number.isFinite(parsed.barWeight) && parsed.barWeight > 0
        ? parsed.barWeight
        : defaults.barWeight;
    const increment = ([1, 2, 5, 10, 15] as IncrementOption[]).includes(parsed.increment as IncrementOption)
      ? (parsed.increment as IncrementOption)
      : defaults.increment;
    const platePairs: Record<number, number> = { ...defaults.platePairs };
    if (parsed.platePairs && typeof parsed.platePairs === "object") {
      for (const [k, v] of Object.entries(parsed.platePairs)) {
        const nk = Number(k);
        const nv = Number(v);
        if (Number.isFinite(nk) && Number.isFinite(nv) && nv >= 0) {
          platePairs[nk] = Math.min(10, Math.max(0, Math.round(nv)));
        }
      }
    }
    return { barWeight, platePairs, increment };
  } catch {
    return defaults;
  }
}

export function saveInventory(
  inventory: BarbellInventory,
  guestId?: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getInventoryKey(guestId),
      JSON.stringify(inventory),
    );
  } catch {
    // ignore quota errors
  }
}

export function getDefaultsForUnit(unit: WeightUnit): BarbellInventory {
  return defaultsForUnit(unit);
}
