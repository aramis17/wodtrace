import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Timer } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FavoriteButton } from "@/components/favorite-button";
import { ScoreChart } from "@/components/score-chart";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { toggleWorkoutFavorite } from "@/lib/actions/workouts";
import {
  formatScore,
  scoreSortValue,
  selectBestResult,
} from "@/lib/scoring";
import { formatDateEs } from "@/lib/utils";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";
import { getSignedPhotoUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function WodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const unit = guest.preference?.weightUnit === "LB" ? "LB" : "KG";

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      OR: [{ isSeed: true }, { guestId: guest.id }],
    },
    include: { category: true },
  });
  if (!workout) notFound();

  const [results, favorite] = await Promise.all([
    prisma.workoutResult.findMany({
      where: { guestId: guest.id, workoutId: id },
      include: { media: true },
      orderBy: { performedAt: "desc" },
    }),
    prisma.favorite.findUnique({
      where: {
        guestId_targetType_targetId: {
          guestId: guest.id,
          targetType: "WORKOUT",
          targetId: id,
        },
      },
    }),
  ]);

  const scoreType = workout.scoreType as ScoreType;
  const best = selectBestResult(scoreType, results);

  const chartData = await Promise.all(
    results.map(async (r) => ({
      date: formatDateEs(r.performedAt),
      label: formatDateEs(r.performedAt).split(" ")[0] ?? "",
      timeSeconds: r.timeSeconds,
      reps: r.reps,
      weightKg: r.weightKg,
      rounds: r.rounds,
      extraReps: r.extraReps,
      customValue: r.customValue,
      sortValue: scoreSortValue(scoreType, r),
      photoUrl: r.media
        ? await getSignedPhotoUrl(r.media.storagePath)
        : null,
    })),
  );

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
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl uppercase text-text-primary">
            {workout.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {workout.category ? (
              <Badge tone="muted">{workout.category.name}</Badge>
            ) : null}
            <Badge tone="info">{SCORE_TYPE_LABELS[scoreType]}</Badge>
          </div>
        </div>
        <FavoriteButton
          favorited={Boolean(favorite)}
          onToggle={async () => {
            "use server";
            await toggleWorkoutFavorite(id);
            return;
          }}
        />
      </div>

      <Card className="space-y-3">
        <CardTitle>Descripción</CardTitle>
        <p className="whitespace-pre-wrap text-sm text-text-secondary">
          {workout.description}
        </p>
        {workout.scheme ? (
          <p className="text-sm">
            <span className="text-text-muted">Esquema: </span>
            <span className="text-text-primary">{workout.scheme}</span>
          </p>
        ) : null}
        {workout.rxNotes ? (
          <p className="text-sm">
            <span className="text-ember font-semibold">Rx · </span>
            {workout.rxNotes}
          </p>
        ) : null}
        {workout.scaledNotes ? (
          <p className="text-sm">
            <span className="text-info font-semibold">Escalado · </span>
            {workout.scaledNotes}
          </p>
        ) : null}
      </Card>

      {best ? (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted">
              Mejor marca
            </p>
            <p className="font-display text-2xl text-gold">
              {formatScore(scoreType, best, { weightUnit: unit }).primary}
            </p>
          </div>
          <Badge tone="gold">PR</Badge>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/wods/${id}/log`}>
          <Button className="w-full">Registrar</Button>
        </Link>
        <Link href="/timers">
          <Button variant="secondary" className="w-full">
            <Timer className="h-4 w-4" /> Timer
          </Button>
        </Link>
      </div>

      {workout.isCustom ? (
        <Link href={`/wods/${id}/edit`}>
          <Button variant="ghost" className="w-full">
            Editar WOD
          </Button>
        </Link>
      ) : null}

      <Card>
        <CardTitle className="mb-3">Trayectoria</CardTitle>
        <ScoreChart data={chartData} scoreType={scoreType} weightUnit={unit} />
      </Card>

      <section>
        <h2 className="mb-3 font-display text-xl uppercase text-text-primary">
          Historial
        </h2>
        {results.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="Sé el primero en registrar este WOD."
            action={
              <Link href={`/wods/${id}/log`}>
                <Button>Registrar</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {results.map((r, i) => {
              const score = formatScore(scoreType, r, { weightUnit: unit });
              const photo = chartData[i]?.photoUrl;
              return (
                <li key={r.id}>
                  <Card className="flex items-center gap-3">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-ember">
                        {score.primary}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDateEs(r.performedAt)} · {r.scaling}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </div>
                    <Link href={`/wods/${id}/edit-result/${r.id}`}>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
