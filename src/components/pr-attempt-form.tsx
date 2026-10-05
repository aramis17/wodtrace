"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";
import { formatDateInput } from "@/lib/utils";
import { logPRAttempt } from "@/lib/actions/prs";
import type { ScoreType } from "@/lib/types";

export function PRAttemptForm({
  personalRecordId,
  scoreType,
  weightUnit,
}: {
  personalRecordId: string;
  scoreType: ScoreType;
  weightUnit: "KG" | "LB";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await logPRAttempt(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="personalRecordId" value={personalRecordId} />
      <div>
        <Label htmlFor="performedAt">Fecha</Label>
        <Input
          id="performedAt"
          name="performedAt"
          type="date"
          defaultValue={formatDateInput()}
          required
        />
      </div>
      {scoreType === "WEIGHT" ? (
        <div>
          <Label htmlFor="weight">Peso ({weightUnit === "LB" ? "lb" : "kg"})</Label>
          <Input id="weight" name="weight" type="number" step="0.5" min={0} required />
        </div>
      ) : null}
      {scoreType === "TIME" ? (
        <div>
          <Label htmlFor="time">Tiempo (mm:ss)</Label>
          <Input id="time" name="time" placeholder="1:30" required />
        </div>
      ) : null}
      {scoreType === "AMRAP" || scoreType === "REPS_TIME" || scoreType === "CUSTOM" ? (
        <div>
          <Label htmlFor="reps">Reps</Label>
          <Input id="reps" name="reps" type="number" min={0} required />
        </div>
      ) : null}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" />
      </div>
      {error ? (
        <p className="text-sm text-ember" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando…" : "Registrar intento"}
      </Button>
    </form>
  );
}
