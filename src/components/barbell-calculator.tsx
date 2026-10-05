"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import {
  calculatePlates,
  estimateOneRepMax,
} from "@/lib/barbell";
import {
  DEFAULT_INCREMENT,
  getDefaultsForUnit,
  loadInventory,
  saveInventory,
  type IncrementOption,
  type BarbellInventory,
} from "@/lib/barbell-inventory";
import { roundWeight } from "@/lib/units";
import { Card } from "./ui/card";
import { Input, Label } from "./ui/input";

const MIN_PCT = 30;
const MAX_PCT = 110;

const PLATE_COLORS_LB: Record<number, string> = {
  55: "#171717",
  45: "#2563EB",
  35: "#EAB308",
  25: "#DC2626",
  15: "#EAB308",
  10: "#16A34A",
  5: "#0F0F0F",
  2.5: "#6B7280",
  1.25: "#9CA3AF",
  1: "#D1D5DB",
};

const PLATE_COLORS_KG: Record<number, string> = {
  25: "#DC2626",
  20: "#2563EB",
  15: "#EAB308",
  10: "#16A34A",
  5: "#F9FAFB",
  2.5: "#DC2626",
  1.25: "#9CA3AF",
  1: "#16A34A",
  0.5: "#F3F4F6",
};

function plateColor(weight: number, unit: "KG" | "LB"): string {
  const map = unit === "KG" ? PLATE_COLORS_KG : PLATE_COLORS_LB;
  return map[weight] ?? "#343842";
}

function plateHeight(weight: number, unit: "KG" | "LB"): number {
  const max = unit === "KG" ? 25 : 45;
  const minH = 48;
  const maxH = 96;
  const ratio = Math.max(0.35, Math.min(1, weight / max));
  return Math.round(minH + ratio * (maxH - minH));
}

export function BarbellCalculator({
  defaultUnit = "KG",
}: {
  defaultUnit?: "KG" | "LB";
}) {
  const [unit] = useState<"KG" | "LB">(defaultUnit);
  const [peso, setPeso] = useState(defaultUnit === "KG" ? "100" : "225");
  const [reps, setReps] = useState("1");
  const [inventory, setInventory] = useState<BarbellInventory>(() =>
    getDefaultsForUnit(defaultUnit),
  );
  const [incrementDraft, setIncrementDraft] = useState<IncrementOption>(DEFAULT_INCREMENT);
  const [showIncrement, setShowIncrement] = useState(false);
  const [selectedPct, setSelectedPct] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function hydrate() {
      const loaded = loadInventory(undefined, defaultUnit);
      setInventory(loaded);
      setIncrementDraft(loaded.increment);
      setHydrated(true);
    }
    hydrate();
    const onShow = () => hydrate();
    window.addEventListener("pageshow", onShow);
    window.addEventListener("focus", onShow);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("focus", onShow);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [defaultUnit]);

  useEffect(() => {
    if (!hydrated) return;
    saveInventory(inventory);
  }, [inventory, hydrated]);

  const pesoNum = useMemo(() => {
    const n = Number(String(peso).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [peso]);
  const repsNum = useMemo(() => {
    const n = Number(reps);
    return Number.isFinite(n) ? n : NaN;
  }, [reps]);

  const irmRaw = useMemo(() => {
    if (!Number.isFinite(pesoNum) || pesoNum <= 0) return null;
    if (!Number.isFinite(repsNum) || repsNum <= 0) return null;
    return estimateOneRepMax(pesoNum, repsNum);
  }, [pesoNum, repsNum]);

  const irm = useMemo(() => {
    if (irmRaw == null) return null;
    return roundWeight(irmRaw, unit);
  }, [irmRaw, unit]);

  const increment = inventory.increment;

  const percentages = useMemo(() => {
    if (irm == null) return [];
    const rows: Array<{ pct: number; weight: number }> = [];
    for (let pct = MAX_PCT; pct >= MIN_PCT; pct -= increment) {
      const w = roundWeight((irm * pct) / 100, unit);
      rows.push({ pct, weight: w });
    }
    return rows;
  }, [irm, increment, unit]);

  const selectedRow = useMemo(() => {
    if (selectedPct == null) return null;
    return percentages.find((p) => p.pct === selectedPct) ?? null;
  }, [selectedPct, percentages]);

  const selectedPlates = useMemo(() => {
    if (!selectedRow) return null;
    return calculatePlates(selectedRow.weight, unit, inventory.barWeight, inventory.platePairs);
  }, [selectedRow, unit, inventory]);

  function openIncrement() {
    setIncrementDraft(increment);
    setShowIncrement(true);
  }
  function confirmIncrement() {
    setInventory((prev) => ({ ...prev, increment: incrementDraft }));
    setShowIncrement(false);
  }

  return (
    <div className="space-y-4">
      {/* Header is in page.tsx, but keep compact */}
      {/* Inputs PESO / REPS */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-wider text-text-muted">
              PESO ({unit})
            </Label>
            <div className="mt-2">
              <Input
                aria-label={`Peso en ${unit}`}
                type="number"
                inputMode="decimal"
                min={0}
                step={unit === "KG" ? "0.5" : "1"}
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="h-[64px] text-center text-4xl font-display font-extrabold"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-text-muted">REPS</Label>
            <div className="mt-2">
              <Input
                aria-label="Reps"
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                step={1}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="h-[64px] text-center text-4xl font-display font-extrabold"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 1RM ESTIMADO */}
      <Card className="p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">1RM ESTIMADO</p>
        <p className="mt-2 font-display text-6xl font-extrabold tracking-tight text-text-primary">
          {irm != null ? (
            <>
              {irm}
              <span className="ml-2 text-2xl font-semibold text-text-muted">{unit.toLowerCase()}</span>
            </>
          ) : (
            <span className="text-text-muted">--</span>
          )}
        </p>
      </Card>

      <p className="text-center text-xs uppercase tracking-wider text-text-muted">
        — TOCA UNA FILA PARA VER LOS DISCOS —
      </p>

      {/* PORCENTAJES */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1 rounded bg-ember" />
            <h2 className="font-display text-xl uppercase tracking-wide text-text-primary">PORCENTAJES</h2>
          </div>
          <button
            type="button"
            onClick={openIncrement}
            aria-label="Seleccionar incremento de porcentaje"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-4 text-sm font-semibold text-ember"
          >
            <span className="hidden sm:inline">≡</span>
            <span>{increment} %</span>
          </button>
        </div>

        {irm == null ? (
          <div className="p-6 text-center text-sm text-text-muted">Ingresa peso y reps para ver porcentajes</div>
        ) : (
          <ul className="max-h-[480px] overflow-y-auto divide-y divide-border">
            {percentages.map((row) => (
              <li key={row.pct}>
                <button
                  type="button"
                  onClick={() => setSelectedPct(row.pct)}
                  aria-label={`${row.pct} por ciento, ${row.weight} ${unit === "KG" ? "kilos" : "libras"}, toca para ver discos`}
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-surface"
                >
                  <span className="font-display text-xl font-extrabold text-ember">{row.pct}%</span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-2xl font-extrabold text-text-primary">
                      {row.weight}
                      <span className="ml-1 text-sm font-medium text-text-muted">{unit.toLowerCase()}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Increment selector modal */}
      {showIncrement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={() => setShowIncrement(false)}>
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-surface border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Incremento de porcentaje"
          >
            <div className="border-b border-border p-4 text-center">
              <h3 className="font-semibold text-text-primary">Incremento de porcentaje</h3>
            </div>
            <ul className="divide-y divide-border">
              {([1, 2, 5, 10, 15] as IncrementOption[]).map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => setIncrementDraft(opt)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-card"
                  >
                    <span className={`text-lg ${incrementDraft === opt ? "text-ember font-semibold" : "text-text-primary"}`}>{opt}%</span>
                    {incrementDraft === opt && <Check className="h-5 w-5 text-ember" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowIncrement(false)}
                className="min-h-12 border-r border-border bg-card text-text-secondary"
              >
                Cancelar
              </button>
              <button type="button" onClick={confirmIncrement} className="min-h-12 bg-card font-semibold text-ember">
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plate visualization modal */}
      {selectedRow && selectedPlates && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={() => setSelectedPct(null)}>
          <div
            className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-surface border border-border p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Visualizacion ${selectedRow.pct} por ciento`}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setSelectedPct(null)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-text-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-baseline justify-center gap-3 pr-8">
              <span className="font-display text-3xl font-extrabold text-ember">{selectedRow.pct}%</span>
              <span className="font-display text-3xl font-extrabold text-text-primary">
                {selectedRow.weight}
                <span className="ml-1 text-base font-medium text-text-muted">{unit.toLowerCase()}</span>
              </span>
            </div>

            <div className="relative mt-6 flex h-[140px] items-center justify-center overflow-x-auto">
              {/* bar */}
              <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-600" />
              <div className="absolute left-6 top-1/2 h-8 w-3 -translate-y-1/2 rounded bg-zinc-600" />
              {/* plates */}
              <div className="relative z-10 flex items-center gap-1">
                {selectedPlates.perSide.length === 0 ? (
                  <span className="rounded bg-card px-3 py-1 text-sm text-text-muted">Solo la barra</span>
                ) : (
                  (() => {
                    const flat: Array<{ weight: number; color: string; h: number }> = [];
                    for (const p of selectedPlates.perSide) {
                      for (let i = 0; i < p.countPerSide; i++) {
                        flat.push({ weight: p.weight, color: plateColor(p.weight, unit), h: plateHeight(p.weight, unit) });
                      }
                    }
                    return flat.map((pl, idx) => (
                      <div
                        key={`${pl.weight}-${idx}`}
                        className="flex items-center justify-center rounded-md border border-black/20 text-xs font-bold shadow"
                        style={{
                          background: pl.color,
                          color: pl.color === "#F9FAFB" || pl.color === "#F3F4F6" || pl.color === "#D1D5DB" ? "#0B0C10" : "#FAFAFA",
                          width: 28,
                          height: pl.h,
                        }}
                      >
                        <span className="[writing-mode:vertical-lr] rotate-180 select-none">{pl.weight}</span>
                      </div>
                    ));
                  })()
                )}
              </div>
              <div className="absolute right-6 top-1/2 h-8 w-3 -translate-y-1/2 rounded bg-zinc-700" />
            </div>

            {selectedPlates.achieved !== selectedRow.weight && (
              <p className="mt-4 text-center text-sm text-text-secondary">
                Peso más cercano posible: <span className="font-semibold text-text-primary">{selectedPlates.achieved} {unit.toLowerCase()}</span>
              </p>
            )}
            {selectedPlates.remainder > 0 && selectedPlates.achieved === selectedRow.weight && (
              <p className="mt-2 text-center text-xs text-text-muted">Resto no cargable: {selectedPlates.remainder} {unit.toLowerCase()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
