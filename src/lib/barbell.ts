import type { WeightUnit } from "./units";
import { convertWeight, roundWeight } from "./units";

export function estimateOneRepMax(
  weight: number,
  reps: number,
  formula: "epley" | "brzycki" = "epley",
): number | null {
  if (!Number.isFinite(weight) || weight <= 0) return null;
  if (!Number.isFinite(reps) || reps <= 0) return null;
  const r = Math.round(reps);
  const clamped = Math.max(1, Math.min(30, r));
  if (clamped === 1) return weight;
  if (formula === "brzycki") {
    if (clamped >= 37) return null;
    return weight * (36 / (37 - clamped));
  }
  return weight * (1 + clamped / 30);
}

/** Standard plate denominations stored in KG */
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5] as const;
export const PLATES_LB = [55, 45, 35, 25, 15, 10, 5, 2.5, 1.25, 1] as const;

export const DEFAULT_BAR_KG = 20;
export const DEFAULT_BAR_LB = 45;

export interface PlatePair {
  weight: number;
  countPerSide: number;
}

export interface BarbellResult {
  unit: WeightUnit;
  barWeight: number;
  target: number;
  loadable: number;
  achieved: number;
  remainder: number;
  perSide: PlatePair[];
  totalPlates: number;
}

export function calculatePlates(
  target: number,
  unit: WeightUnit,
  barWeight?: number,
  availablePlates?: number[] | Record<number, number> | Map<number, number>,
  availablePairs?: Record<number, number> | Map<number, number>,
): BarbellResult {
  // Allow 4th arg to be pairs map for ergonomic calls: calculatePlates(t, unit, bar, pairsMap)
  let platesArg: number[] | undefined;
  let pairsArg: Record<number, number> | Map<number, number> | undefined = availablePairs;
  if (availablePlates !== undefined) {
    if (Array.isArray(availablePlates)) {
      platesArg = availablePlates;
    } else {
      pairsArg = availablePlates as Record<number, number> | Map<number, number>;
    }
  }
  const bar =
    barWeight ??
    (unit === "KG" ? DEFAULT_BAR_KG : DEFAULT_BAR_LB);

  const pairsMap: Map<number, number> | null = pairsArg
    ? pairsArg instanceof Map
      ? pairsArg
      : new Map(
          Object.entries(pairsArg).map(([k, v]) => [Number(k), Number(v)]),
        )
    : null;

  const defaultPlates = unit === "KG" ? [...PLATES_KG] : [...PLATES_LB];
  const plates =
    platesArg ??
    (pairsMap
      ? [...new Set([...defaultPlates, ...pairsMap.keys()])]
      : defaultPlates);

  const sorted = [...plates].sort((a, b) => b - a);
  const loadable = Math.max(0, target - bar);
  let remainingPerSide = loadable / 2;
  const remainingPairs = new Map<number, number>();
  for (const plate of sorted) {
    remainingPairs.set(
      plate,
      pairsMap ? (pairsMap.get(plate) ?? 0) : Infinity,
    );
  }

  const perSide: PlatePair[] = [];
  for (const plate of sorted) {
    const maxPairs = remainingPairs.get(plate) ?? 0;
    if (maxPairs <= 0) continue;
    const countUnlimited = Math.floor((remainingPerSide + 1e-9) / plate);
    const count = Math.min(countUnlimited, maxPairs);
    if (count > 0) {
      perSide.push({ weight: plate, countPerSide: count });
      remainingPerSide -= count * plate;
      remainingPairs.set(plate, maxPairs - count);
    }
  }

  let usedPerSide = perSide.reduce(
    (sum, p) => sum + p.weight * p.countPerSide,
    0,
  );
  let achieved = bar + usedPerSide * 2;
  const gap = target - achieved;

  if (gap > 1e-9) {
    const bump = minCeilBumpPerSide(remainingPairs, gap / 2);
    if (bump) {
      usedPerSide += bump.extraPerSide;
      achieved = bar + usedPerSide * 2;
      mergePlateCounts(perSide, bump.added);
    }
  }

  const remainder = Math.max(0, roundWeight(achieved - target, unit));

  return {
    unit,
    barWeight: bar,
    target,
    loadable,
    achieved: roundWeight(achieved, unit),
    remainder,
    perSide,
    totalPlates: perSide.reduce((s, p) => s + p.countPerSide * 2, 0),
  };
}

function mergePlateCounts(perSide: PlatePair[], added: PlatePair[]) {
  for (const a of added) {
    const existing = perSide.find((p) => p.weight === a.weight);
    if (existing) existing.countPerSide += a.countPerSide;
    else perSide.push({ weight: a.weight, countPerSide: a.countPerSide });
  }
  perSide.sort((a, b) => b.weight - a.weight);
}

function minCeilBumpPerSide(
  remainingPairs: Map<number, number>,
  needed: number,
): { extraPerSide: number; added: PlatePair[] } | null {
  const items: number[] = [];
  for (const [w, n] of remainingPairs) {
    const cap = n === Infinity ? 8 : n;
    for (let i = 0; i < cap; i++) items.push(w);
  }
  if (items.length === 0) return null;

  const SCALE = 4;
  const toS = (w: number) => Math.round(w * SCALE);
  const needS = Math.ceil(needed * SCALE - 1e-9);
  const maxS = items.reduce((s, w) => s + toS(w), 0);
  if (maxS < needS) return null;

  const parent = new Int32Array(maxS + 1).fill(-1);
  const usedPlate = new Float64Array(maxS + 1);
  parent[0] = -2;
  for (const w of items) {
    const pw = toS(w);
    for (let s = maxS - pw; s >= 0; s--) {
      if (parent[s] === -1) continue;
      const ns = s + pw;
      if (parent[ns] === -1) {
        parent[ns] = s;
        usedPlate[ns] = w;
      }
    }
  }

  let best = -1;
  for (let s = needS; s <= maxS; s++) {
    if (parent[s] !== -1) {
      best = s;
      break;
    }
  }
  if (best < 0) return null;

  const counts = new Map<number, number>();
  let cur = best;
  while (cur > 0) {
    const w = usedPlate[cur];
    counts.set(w, (counts.get(w) ?? 0) + 1);
    cur = parent[cur];
  }

  return {
    extraPerSide: best / SCALE,
    added: [...counts.entries()]
      .map(([weight, countPerSide]) => ({ weight, countPerSide }))
      .sort((a, b) => b.weight - a.weight),
  };
}

export function convertBarbellTarget(
  target: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  return roundWeight(convertWeight(target, from, to), to);
}
