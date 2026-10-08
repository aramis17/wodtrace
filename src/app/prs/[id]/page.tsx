import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FavoriteButton } from "@/components/favorite-button";
import { ScoreChart } from "@/components/score-chart";
import { PRAttemptForm } from "@/components/pr-attempt-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { togglePRFavorite, deletePRAttempt } from "@/lib/actions/prs";
import {
  formatScore,
  scoreSortValue,
  selectBestResult,
} from "@/lib/scoring";
import { formatDateEs } from "@/lib/utils";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function PRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const unit = preferredWeightUnit(guest.preference);

  const pr = await prisma.personalRecord.findFirst({
    where: {
      id,
      OR: [{ isSeed: true }, { guestId: guest.id }],
    },
  });
  if (!pr) notFound();

  const [attempts, favorite] = await Promise.all([
    prisma.personalRecordAttempt.findMany({
      where: { guestId: guest.id, personalRecordId: id },
      orderBy: { performedAt: "desc" },
    }),
    prisma.favorite.findUnique({
      where: {
        guestId_targetType_targetId: {
          guestId: guest.id,
          targetType: "PERSONAL_RECORD",
          targetId: id,
        },
      },
    }),
  ]);

  const scoreType = pr.scoreType as ScoreType;
  const best = selectBestResult(scoreType, attempts);
  const chartData = attempts.map((a) => ({
    date: formatDateEs(a.performedAt),
    label: formatDateEs(a.performedAt).split(" ")[0] ?? "",
    timeSeconds: a.timeSeconds,
    reps: a.reps,
    weightKg: a.weightKg,
    sortValue: scoreSortValue(scoreType, a),
  }));

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
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl uppercase text-text-primary">
            {pr.name}
          </h1>
          <Badge tone="info" className="mt-1">
            {SCORE_TYPE_LABELS[scoreType]}
          </Badge>
        </div>
        <FavoriteButton
          favorited={Boolean(favorite)}
          onToggle={async () => {
            "use server";
            await togglePRFavorite(id);
            return;
          }}
        />
      </div>

      {best ? (
        <Card>
          <p className="text-xs uppercase tracking-wider text-text-muted">
            Mejor intento
          </p>
          <p className="font-display text-3xl text-gold">
            {formatScore(scoreType, best, { weightUnit: unit }).primary}
          </p>
        </Card>
      ) : null}

      <Card>
        <CardTitle className="mb-3">Progreso</CardTitle>
        <ScoreChart data={chartData} scoreType={scoreType} weightUnit={unit} />
      </Card>

      <Card>
        <CardTitle className="mb-3">Nuevo intento</CardTitle>
        <PRAttemptForm
          personalRecordId={id}
          scoreType={scoreType}
          weightUnit={unit}
        />
      </Card>

      <section>
        <h2 className="mb-3 font-display text-xl uppercase text-text-primary">
          Historial
        </h2>
        {attempts.length === 0 ? (
          <EmptyState
            title="Sin intentos"
            description="Registra tu primer intento arriba."
          />
        ) : (
          <ul className="space-y-2">
            {attempts.map((a) => {
              const score = formatScore(scoreType, a, { weightUnit: unit });
              return (
                <li key={a.id}>
                  <Card className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-primary">
                        {score.primary}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDateEs(a.performedAt)}
                        {a.notes ? ` · ${a.notes}` : ""}
                      </p>
                    </div>
                    <ConfirmDelete
                      successMessage="Intento eliminado"
                      action={async () => {
                        "use server";
                        const fd = new FormData();
                        fd.set("id", a.id);
                        return deletePRAttempt(fd);
                      }}
                    />
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
