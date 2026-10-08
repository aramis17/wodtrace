import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { formatScore, selectBestResult } from "@/lib/scoring";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function PRsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fav?: string }>;
}) {
  const { q = "", fav } = await searchParams;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const unit = preferredWeightUnit(guest.preference);

  const favorites = await prisma.favorite.findMany({
    where: { guestId: guest.id, targetType: "PERSONAL_RECORD" },
    select: { targetId: true },
  });
  const favSet = new Set(favorites.map((f) => f.targetId));

  const prs = await prisma.personalRecord.findMany({
    where: {
      AND: [
        { OR: [{ isSeed: true }, { guestId: guest.id }] },
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        fav === "1" ? { id: { in: [...favSet] } } : {},
      ],
    },
    include: {
      attempts: {
        where: { guestId: guest.id },
        orderBy: { performedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase text-text-primary">
            Récords
          </h1>
          <p className="text-sm text-text-muted">{prs.length} movimientos</p>
        </div>
        <Link href="/prs/new">
          <Button size="icon" aria-label="Crear PR">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar…"
          className="min-h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted"
        />
      </form>

      <div className="flex gap-2">
        <Link
          href="/prs"
          className={cn(
            "inline-flex min-h-12 items-center rounded-xl px-4 text-sm font-semibold",
            fav !== "1"
              ? "bg-primary text-on-primary"
              : "border border-border bg-card text-text-secondary",
          )}
        >
          Todos
        </Link>
        <Link
          href="/prs?fav=1"
          className={cn(
            "inline-flex min-h-12 items-center rounded-xl px-4 text-sm font-semibold",
            fav === "1"
              ? "bg-primary text-on-primary"
              : "border border-border bg-card text-text-secondary",
          )}
        >
          Favoritos
        </Link>
      </div>

      {prs.length === 0 ? (
        <EmptyState
          title="Sin PRs"
          description="Crea un récord personalizado o ejecuta las semillas."
          action={
            <Link href="/prs/new">
              <Button>Crear PR</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {prs.map((pr) => {
            const best = selectBestResult(
              pr.scoreType as ScoreType,
              pr.attempts,
            );
            const score = best
              ? formatScore(pr.scoreType as ScoreType, best, {
                  weightUnit: unit,
                })
              : null;
            return (
              <li key={pr.id}>
                <Link href={`/prs/${pr.id}`}>
                  <Card className="flex items-center justify-between gap-3 transition-colors hover:border-primary/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary">
                          {pr.name}
                        </p>
                        {favSet.has(pr.id) ? (
                          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        ) : null}
                      </div>
                      <Badge tone="muted" className="mt-1">
                        {SCORE_TYPE_LABELS[pr.scoreType as ScoreType]}
                      </Badge>
                    </div>
                    <p className="font-display text-lg text-gold">
                      {score?.primary ?? "—"}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
