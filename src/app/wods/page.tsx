import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; fav?: string }>;
}) {
  const { q = "", cat = "all", fav } = await searchParams;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const [categories, favorites] = await Promise.all([
    prisma.workoutCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.favorite.findMany({
      where: { guestId: guest.id, targetType: "WORKOUT" },
      select: { targetId: true },
    }),
  ]);
  const favSet = new Set(favorites.map((f) => f.targetId));

  const workouts = await prisma.workout.findMany({
    where: {
      AND: [
        {
          OR: [{ isSeed: true }, { guestId: guest.id }],
        },
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        cat !== "all" && cat !== "favorites"
          ? { category: { slug: cat } }
          : {},
        fav === "1" || cat === "favorites"
          ? { id: { in: [...favSet] } }
          : {},
      ],
    },
    include: { category: true },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase text-text-primary">
            Biblioteca
          </h1>
          <p className="text-sm text-text-muted">{workouts.length} WODs</p>
        </div>
        <Link href="/wods/new">
          <Button size="icon" aria-label="Crear WOD">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      <form>
        <label htmlFor="q" className="sr-only">
          Buscar WOD
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre…"
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <CatChip href="/wods" active={cat === "all" && fav !== "1"} label="Todos" />
        <CatChip
          href="/wods?cat=favorites"
          active={cat === "favorites" || fav === "1"}
          label="Favoritos"
        />
        {categories.map((c) => (
          <CatChip
            key={c.id}
            href={`/wods?cat=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={cat === c.slug}
            label={c.name}
          />
        ))}
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          title="Sin WODs"
          description="Prueba otra búsqueda o crea un WOD personalizado."
          action={
            <Link href="/wods/new">
              <Button>Crear WOD</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link href={`/wods/${w.id}`}>
                <Card className="flex items-start justify-between gap-3 transition-colors hover:border-primary/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary">{w.name}</p>
                      {favSet.has(w.id) ? (
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                      {w.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {w.category ? (
                        <Badge tone="muted">{w.category.name}</Badge>
                      ) : null}
                      <Badge tone="info">
                        {SCORE_TYPE_LABELS[w.scoreType as ScoreType]}
                      </Badge>
                      {w.isCustom ? <Badge tone="primary">Custom</Badge> : null}
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CatChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 shrink-0 items-center rounded-xl px-4 text-sm font-semibold",
        active
          ? "bg-primary text-on-primary"
          : "border border-border bg-card text-text-secondary",
      )}
    >
      {label}
    </Link>
  );
}
