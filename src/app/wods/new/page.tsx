import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createCustomWorkout } from "@/lib/actions/workouts";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

export default function NewWodPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/wods"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl uppercase text-text-primary">
          Nuevo WOD
        </h1>
      </div>
      <ActionForm action={createCustomWorkout} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" required />
        </div>
        <div>
          <Label htmlFor="scoreType">Puntuación</Label>
          <Select id="scoreType" name="scoreType" defaultValue="TIME">
            {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((k) => (
              <option key={k} value={k}>
                {SCORE_TYPE_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="scheme">Esquema</Label>
          <Input id="scheme" name="scheme" placeholder="For time / AMRAP 20…" />
        </div>
        <div>
          <Label htmlFor="rxNotes">Notas Rx</Label>
          <Input id="rxNotes" name="rxNotes" />
        </div>
        <div>
          <Label htmlFor="scaledNotes">Notas escalado</Label>
          <Input id="scaledNotes" name="scaledNotes" />
        </div>
        <SubmitButton className="w-full" pendingLabel="Creando…">
          Crear
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
