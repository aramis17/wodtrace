import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResultForm } from "@/components/result-form";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import type { ScoreType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>;
}) {
  const { id, resultId } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const result = await prisma.workoutResult.findFirst({
    where: { id: resultId, guestId: guest.id, workoutId: id },
    include: { workout: true },
  });
  if (!result) notFound();

  const unit = guest.preference?.weightUnit === "LB" ? "LB" : "KG";

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
        <div>
          <h1 className="font-display text-2xl uppercase text-text-primary">
            Editar resultado
          </h1>
          <p className="text-sm text-text-muted">{result.workout.name}</p>
        </div>
      </div>
      <ResultForm
        workoutId={id}
        scoreType={result.workout.scoreType as ScoreType}
        weightUnit={unit}
        result={{
          id: result.id,
          performedAt: result.performedAt.toISOString(),
          scaling: result.scaling,
          timeSeconds: result.timeSeconds,
          reps: result.reps,
          weightKg: result.weightKg,
          rounds: result.rounds,
          extraReps: result.extraReps,
          customValue: result.customValue,
          notes: result.notes,
        }}
      />
    </div>
  );
}
