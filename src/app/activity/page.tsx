import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { formatScore } from "@/lib/scoring";
import { formatDateEs } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { deleteWorkoutResult } from "@/lib/actions/results";
import { deletePRAttempt } from "@/lib/actions/prs";
import type { ScoreType } from "@/lib/types";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

const filters = [
  { id: "all", label: "Todos" },
  { id: "wods", label: "WODs" },
  { id: "prs", label: "PRs" },
] as const;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; date?: string }>;
}) {
  const { filter = "all", date } = await searchParams;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const unit = preferredWeightUnit(guest.preference);

  const dateFilter = date
    ? {
        gte: new Date(`${date}T00:00:00`),
        lte: new Date(`${date}T23:59:59.999`),
      }
    : undefined;

  const showWods = filter === "all" || filter === "wods";
  const showPrs = filter === "all" || filter === "prs";

  const [wodResults, prAttempts] = await Promise.all([
    showWods
      ? prisma.workoutResult.findMany({
          where: {
            guestId: guest.id,
            ...(dateFilter ? { performedAt: dateFilter } : {}),
          },
          include: { workout: true },
          orderBy: { performedAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    showPrs
      ? prisma.personalRecordAttempt.findMany({
          where: {
            guestId: guest.id,
            ...(dateFilter ? { performedAt: dateFilter } : {}),
          },
          include: { personalRecord: true },
          orderBy: { performedAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  type Item =
    | {
        kind: "wod";
        id: string;
        at: Date;
        title: string;
        href: string;
        score: string;
        meta: string;
      }
    | {
        kind: "pr";
        id: string;
        at: Date;
        title: string;
        href: string;
        score: string;
        meta: string;
      };

  const items: Item[] = [
    ...wodResults.map((r) => {
      const score = formatScore(r.workout.scoreType as ScoreType, r, {
        weightUnit: unit,
      });
      return {
        kind: "wod" as const,
        id: r.id,
        at: r.performedAt,
        title: r.workout.name,
        href: `/wods/${r.workoutId}`,
        score: score.primary,
        meta: `${formatDateEs(r.performedAt)} · ${r.scaling}`,
      };
    }),
    ...prAttempts.map((a) => {
      const score = formatScore(a.personalRecord.scoreType as ScoreType, a, {
        weightUnit: unit,
      });
      return {
        kind: "pr" as const,
        id: a.id,
        at: a.performedAt,
        title: a.personalRecord.name,
        href: `/prs/${a.personalRecordId}`,
        score: score.primary,
        meta: `${formatDateEs(a.performedAt)} · PR`,
      };
    }),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl uppercase text-text-primary">
          Actividad
        </h1>
        <p className="text-sm text-text-muted">Historial de entrenamientos</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={`/activity?filter=${f.id}${date ? `&date=${date}` : ""}`}
            className={cn(
              "min-h-12 shrink-0 rounded-xl px-4 text-sm font-semibold inline-flex items-center",
              filter === f.id
                ? "bg-primary text-on-primary"
                : "bg-card border border-border text-text-secondary",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <form method="get" action="/activity" className="flex gap-2">
        <input type="hidden" name="filter" value={filter} />
        <label htmlFor="date" className="sr-only">
          Filtrar por fecha
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={date}
          className="min-h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm text-text-primary"
        />
        <button
          type="submit"
          className="min-h-12 rounded-xl bg-card border border-border px-4 text-sm font-semibold text-text-primary"
        >
          Filtrar
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ajusta el filtro o registra un entrenamiento."
          action={
            <Link href="/wods">
              <Button>Ir a WODs</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Card className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link href={item.href} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-text-primary">
                        {item.title}
                      </p>
                      <Badge tone={item.kind === "pr" ? "gold" : "info"}>
                        {item.kind === "pr" ? "PR" : "WOD"}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">{item.meta}</p>
                  </Link>
                  <p className="font-display text-lg text-primary">{item.score}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-2">
                  {item.kind === "wod" ? (
                    <>
                      <Link href={`${item.href}/edit-result/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <ConfirmDelete
                        successMessage="Resultado eliminado"
                        action={async () => {
                          "use server";
                          const fd = new FormData();
                          fd.set("id", item.id);
                          return deleteWorkoutResult(fd);
                        }}
                      />
                    </>
                  ) : (
                    <ConfirmDelete
                      successMessage="Intento eliminado"
                      action={async () => {
                        "use server";
                        const fd = new FormData();
                        fd.set("id", item.id);
                        return deletePRAttempt(fd);
                      }}
                    />
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
