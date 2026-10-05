export type WeightUnit = "KG" | "LB";

const LB_PER_KG = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) return value;
  return from === "KG" ? kgToLb(value) : lbToKg(value);
}

export function roundWeight(value: number, unit: WeightUnit): number {
  // Common plate increments: 0.5 kg / 1 lb feel natural
  const step = unit === "KG" ? 0.5 : 1;
  return Math.round(value / step) * step;
}

export function formatWeight(
  kg: number,
  unit: WeightUnit,
  digits = 1,
): string {
  const value = unit === "KG" ? kg : kgToLb(kg);
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  const label = unit === "KG" ? "kg" : "lb";
  return `${rounded} ${label}`;
}

export function parseWeightInput(
  raw: string,
  unit: WeightUnit,
): number | null {
  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return unit === "KG" ? n : lbToKg(n);
}
