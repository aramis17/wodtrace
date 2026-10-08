"use client";

import { ActionForm, SubmitButton } from "./action-form";
import { Input, Label, Select, Textarea } from "./ui/input";
import { formatDateInput } from "@/lib/utils";
import { formatSeconds } from "@/lib/scoring";
import type { ScoreType } from "@/lib/types";
import { logWorkoutResult, updateWorkoutResult } from "@/lib/actions/results";

interface ResultFormProps {
  workoutId: string;
  scoreType: ScoreType;
  weightUnit: "KG" | "LB";
  /** Where to go after saving; defaults to the WOD detail page. */
  returnTo?: string;
  result?: {
    id: string;
    performedAt: string;
    scaling: "RX" | "SCALED";
    timeSeconds?: number | null;
    reps?: number | null;
    weightKg?: number | null;
    rounds?: number | null;
    extraReps?: number | null;
    customValue?: string | null;
    notes?: string | null;
  };
}

export function ResultForm({
  workoutId,
  scoreType,
  weightUnit,
  returnTo,
  result,
}: ResultFormProps) {
  const isEdit = Boolean(result);

  async function submit(formData: FormData) {
    const res = isEdit
      ? await updateWorkoutResult(formData)
      : await logWorkoutResult(formData);
    if (res && "error" in res && res.error) return { error: res.error };
    return {
      message: isEdit ? "Resultado actualizado" : "Resultado registrado",
      redirectTo: returnTo ?? `/wods/${workoutId}`,
    };
  }

  const weightDisplay =
    result?.weightKg != null
      ? weightUnit === "LB"
        ? String(Math.round(result.weightKg * 2.2046226218 * 10) / 10)
        : String(result.weightKg)
      : "";

  return (
    <ActionForm action={submit} className="space-y-4">
      <input type="hidden" name="workoutId" value={workoutId} />
      {result ? <input type="hidden" name="id" value={result.id} /> : null}

      <div>
        <Label htmlFor="performedAt">Fecha</Label>
        <Input
          id="performedAt"
          name="performedAt"
          type="date"
          defaultValue={
            result
              ? formatDateInput(new Date(result.performedAt))
              : formatDateInput()
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="scaling">Escalado</Label>
        <Select
          id="scaling"
          name="scaling"
          defaultValue={result?.scaling ?? "RX"}
        >
          <option value="RX">Rx</option>
          <option value="SCALED">Escalado</option>
        </Select>
      </div>

      {scoreType === "TIME" || scoreType === "REPS_TIME" ? (
        <div>
          <Label htmlFor="time">Tiempo (mm:ss)</Label>
          <Input
            id="time"
            name="time"
            placeholder="5:30"
            defaultValue={
              result?.timeSeconds != null
                ? formatSeconds(result.timeSeconds)
                : ""
            }
            required
          />
        </div>
      ) : null}

      {scoreType === "REPS_TIME" ? (
        <div>
          <Label htmlFor="reps">Repeticiones</Label>
          <Input
            id="reps"
            name="reps"
            type="number"
            min={0}
            defaultValue={result?.reps ?? ""}
            required
          />
        </div>
      ) : null}

      {scoreType === "WEIGHT" ? (
        <div>
          <Label htmlFor="weight">Peso ({weightUnit === "LB" ? "lb" : "kg"})</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.5"
            min={0}
            defaultValue={weightDisplay}
            required
          />
        </div>
      ) : null}

      {scoreType === "AMRAP" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rounds">Rondas</Label>
            <Input
              id="rounds"
              name="rounds"
              type="number"
              min={0}
              defaultValue={result?.rounds ?? ""}
              required
            />
          </div>
          <div>
            <Label htmlFor="extraReps">+ Reps</Label>
            <Input
              id="extraReps"
              name="extraReps"
              type="number"
              min={0}
              defaultValue={result?.extraReps ?? 0}
            />
          </div>
        </div>
      ) : null}

      {scoreType === "CUSTOM" ? (
        <div>
          <Label htmlFor="customValue">Resultado</Label>
          <Input
            id="customValue"
            name="customValue"
            defaultValue={result?.customValue ?? ""}
            required
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={result?.notes ?? ""}
          placeholder="Sensaciones, escalados, etc."
        />
      </div>

      {!isEdit ? (
        <div>
          <Label htmlFor="photo">Foto (opcional)</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="pt-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary"
          />
        </div>
      ) : null}

      <SubmitButton className="w-full" pendingLabel="Guardando…">
        {isEdit ? "Actualizar" : "Registrar resultado"}
      </SubmitButton>
    </ActionForm>
  );
}
