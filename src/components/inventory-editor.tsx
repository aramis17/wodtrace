"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  getDefaultsForUnit,
  loadInventory,
  saveInventory,
  type BarbellInventory,
} from "@/lib/barbell-inventory";
import { Card } from "./ui/card";
import { Input, Label } from "./ui/input";

const PLATES_LB = [55, 45, 35, 25, 15, 10, 5, 2.5, 1.25, 1] as const;
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5] as const;

export function InventoryEditor({ defaultUnit = "LB" }: { defaultUnit?: "KG" | "LB" }) {
  const [unit] = useState<"KG" | "LB">(defaultUnit);
  const [inv, setInv] = useState<BarbellInventory>(() => getDefaultsForUnit(defaultUnit));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadInventory(undefined, defaultUnit);
    setInv(loaded);
    setHydrated(true);
  }, [defaultUnit]);

  useEffect(() => {
    if (!hydrated) return;
    saveInventory(inv);
  }, [inv, hydrated]);

  const plates = unit === "KG" ? PLATES_KG : PLATES_LB;
  const maxPairs = 10;

  function updateBar(v: string) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) {
      // allow empty string during typing, but don't save invalid
      setInv((prev) => ({ ...prev, barWeight: n as unknown as number }));
      return;
    }
    setInv((prev) => ({ ...prev, barWeight: n }));
  }

  function adjustPlate(weight: number, delta: number) {
    setInv((prev) => {
      const cur = prev.platePairs[weight] ?? 0;
      const next = Math.max(0, Math.min(maxPairs, cur + delta));
      return { ...prev, platePairs: { ...prev.platePairs, [weight]: next } };
    });
  }

  // Display barWeight as string; handle NaN case
  const barDisplay = Number.isFinite(inv.barWeight) ? String(inv.barWeight) : "";

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <Label className="text-xs uppercase tracking-wider text-text-muted">PESO DE LA BARRA</Label>
        <div className="relative">
          <Input
            aria-label="Peso de la barra"
            type="number"
            inputMode="decimal"
            min={0}
            step={unit === "KG" ? "0.5" : "1"}
            value={barDisplay}
            onChange={(e) => updateBar(e.target.value)}
            className="h-14 pr-12 text-2xl font-display font-extrabold"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
            {unit}
          </span>
        </div>
        <p className="text-xs text-text-muted">Peso de la barra vacía, usado para el cálculo de los discos.</p>
      </Card>

      <Card className="p-4">
        <h2 className="text-xs uppercase tracking-wider text-text-muted">PARES DE DISCOS DISPONIBLES</h2>
        <ul className="mt-4 divide-y divide-border">
          {plates.map((w) => {
            const count = inv.platePairs[w] ?? 0;
            return (
              <li key={w} className="flex items-center justify-between py-3">
                <span className="text-lg font-semibold text-text-primary">
                  {w} {unit.toLowerCase()}
                </span>
                <span className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Decrementar ${w} ${unit}`}
                    disabled={count <= 0}
                    onClick={() => adjustPlate(w, -1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ember disabled:opacity-30 disabled:text-text-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[80px] text-center text-sm font-medium text-text-primary" aria-live="polite">
                    {count} pares
                  </span>
                  <button
                    type="button"
                    aria-label={`Incrementar ${w} ${unit}`}
                    disabled={count >= maxPairs}
                    onClick={() => adjustPlate(w, 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ember disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
