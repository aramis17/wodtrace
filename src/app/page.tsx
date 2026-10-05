import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { formatScore } from "@/lib/scoring";
import { formatDateEs } from "@/lib/utils";
import type { ScoreType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const unit = guest.preference?.weightUnit === "LB" ? "LB" : "KG";
  const levelIndex = guest.preference?.athleticLevelIndex ?? 0;

  const [levels, results, prAttempts, featured, resultCount, prCount] =
    await Promise.all([
      prisma.athleticLevel.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.workoutResult.findMany({
        where: { guestId: guest.id },
        include: { workout: true },
        orderBy: { performedAt: "desc" },
        take: 5,
      }),
      prisma.personalRecordAttempt.count({ where: { guestId: guest.id } }),
      prisma.workout.findFirst({
        where: { isSeed: true, slug: "fran" },
      }),
      prisma.workoutResult.count({ where: { guestId: guest.id } }),
      prisma.personalRecordAttempt.count({ where: { guestId: guest.id } }),
    ]);

  const level = levels[levelIndex] ?? levels[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = await prisma.workoutResult.count({
    where: { guestId: guest.id, performedAt: { gte: weekAgo } },
  });

  const totalActivity = resultCount + prCount;
  const progressTarget = 20;
  const progressValue = Math.min(totalActivity, progressTarget);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Hola
          </p>
          <h1 className="font-display text-3xl uppercase text-text-primary">
            {guest.alias}
          </h1>
        </div>
        <Badge tone="ember">Demo compartida</Badge>
      </header>

      <section
        className="overflow-hidden rounded-2xl border border-border p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,61,35,0.25) 0%, rgba(255,107,53,0.12) 50%, #1C1F27 100%)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">
          WOD destacado
        </p>
        {featured ? (
          <>
            <h2 className="mt-1 font-display text-3xl uppercase text-text-primary">
              {featured.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
              {featured.description}
            </p>
            <Link
              href={`/wods/${featured.id}`}
              className="mt-4 inline-flex min-h-12 items-center gap-1 text-sm font-semibold text-ember"
            >
              Ver y registrar <ChevronRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="mt-2 text-sm text-text-muted">
            Ejecuta las semillas para cargar WODs.
          </p>
        )}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="font-display text-2xl text-text-primary">{resultCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">
            WODs
          </p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl text-text-primary">{prAttempts}</p>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">
            PRs
          </p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl text-text-primary">{weekCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">
            7 días
          </p>
        </Card>
      </section>

      <Card className="flex items-center gap-5">
        <ProgressRing
          value={progressValue}
          max={progressTarget}
          label={`${progressValue}`}
          sublabel={`de ${progressTarget}`}
        />
        <div className="flex-1">
          <CardTitle>Progreso</CardTitle>
          <p className="mt-1 text-sm text-text-muted">
            Registros totales hacia tu meta semanal de actividad.
          </p>
          {level ? (
            <div className="mt-3">
              <Badge tone="gold">{level.name}</Badge>
              <p className="mt-1 text-xs text-text-muted">{level.description}</p>
            </div>
          ) : null}
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase text-text-primary">
            Recientes
          </h2>
          <Link
            href="/activity"
            className="text-sm font-medium text-ember min-h-12 inline-flex items-center"
          >
            Ver todo
          </Link>
        </div>
        {results.length === 0 ? (
          <EmptyState
            title="Sin actividad"
            description="Registra tu primer WOD o PR para verlo aquí."
            action={
              <Link href="/wods">
                <Button>Explorar WODs</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {results.map((r) => {
              const score = formatScore(
                r.workout.scoreType as ScoreType,
                r,
                { weightUnit: unit },
              );
              return (
                <li key={r.id}>
                  <Link href={`/wods/${r.workoutId}`}>
                    <Card className="flex items-center justify-between gap-3 transition-colors hover:border-ember/40">
                      <div>
                        <p className="font-semibold text-text-primary">
                          {r.workout.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDateEs(r.performedAt)} · {r.scaling}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-ember">
                          {score.primary}
                        </p>
                        {score.secondary ? (
                          <p className="text-xs text-text-muted">
                            {score.secondary}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
