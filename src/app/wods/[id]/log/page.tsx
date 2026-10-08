import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResultForm } from "@/components/result-form";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { visibleWorkoutWhere } from "@/lib/teams";
import { GuestLoading } from "@/lib/guest-page";
import type { ScoreType } from "@/lib/types";
import { safeNextPath } from "@/lib/utils";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function LogResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const returnTo = from ? safeNextPath(from) : undefined;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const workout = await prisma.workout.findFirst({
    where: {
      id,
      ...visibleWorkoutWhere(guest.id),
    },
  });
  if (!workout) notFound();

  const unit = preferredWeightUnit(guest.preference);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href={returnTo ?? `/wods/${id}`}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl uppercase text-text-primary">
            Registrar
          </h1>
          <p className="text-sm text-text-muted">{workout.name}</p>
        </div>
      </div>
      <ResultForm
        workoutId={id}
        scoreType={workout.scoreType as ScoreType}
        weightUnit={unit}
        returnTo={returnTo}
      />
    </div>
  );
}
