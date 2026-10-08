import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Input, Label, Select } from "@/components/ui/input";
import { createCustomPR } from "@/lib/actions/prs";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

export default function NewPRPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/prs"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl uppercase text-text-primary">
          Nuevo PR
        </h1>
      </div>
      <ActionForm action={createCustomPR} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required placeholder="Ej. Yoke carry" />
        </div>
        <div>
          <Label htmlFor="scoreType">Tipo</Label>
          <Select id="scoreType" name="scoreType" defaultValue="WEIGHT">
            {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((k) => (
              <option key={k} value={k}>
                {SCORE_TYPE_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <SubmitButton className="w-full" pendingLabel="Creando…">
          Crear
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
