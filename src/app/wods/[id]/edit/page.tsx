import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import {
  deleteCustomWorkout,
  updateCustomWorkout,
} from "@/lib/actions/workouts";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditWodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const workout = await prisma.workout.findFirst({
    where: { id, guestId: guest.id, isCustom: true },
  });
  if (!workout) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href={`/wods/${id}`}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl uppercase text-text-primary">
          Editar WOD
        </h1>
      </div>
      <ActionForm action={updateCustomWorkout} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={workout.name} required />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={workout.description}
            required
          />
        </div>
        <div>
          <Label htmlFor="scoreType">Puntuación</Label>
          <Select
            id="scoreType"
            name="scoreType"
            defaultValue={workout.scoreType}
          >
            {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((k) => (
              <option key={k} value={k}>
                {SCORE_TYPE_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="scheme">Esquema</Label>
          <Input
            id="scheme"
            name="scheme"
            defaultValue={workout.scheme ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="rxNotes">Notas Rx</Label>
          <Input
            id="rxNotes"
            name="rxNotes"
            defaultValue={workout.rxNotes ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="scaledNotes">Notas escalado</Label>
          <Input
            id="scaledNotes"
            name="scaledNotes"
            defaultValue={workout.scaledNotes ?? ""}
          />
        </div>
        <SubmitButton className="w-full" pendingLabel="Guardando…">
          Guardar
        </SubmitButton>
      </ActionForm>
      <ActionForm
        action={deleteCustomWorkout}
        confirmMessage={`¿Eliminar ${workout.name}? También se borrarán sus resultados.`}
      >
        <input type="hidden" name="id" value={id} />
        <SubmitButton variant="danger" className="w-full">
          Eliminar WOD
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
