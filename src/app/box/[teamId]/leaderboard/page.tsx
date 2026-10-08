import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Leaderboard } from "@/components/leaderboard";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { getTeamForViewer, resultsForBlocks } from "@/lib/teams";
import {
  dateKeyToDate,
  formatDateKeyEs,
  isDateKey,
  todayKey,
} from "@/lib/team-rules";
import type { ScoreType } from "@/lib/types";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ranking" };

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { teamId } = await params;
  const { date } = await searchParams;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const access = await getTeamForViewer(teamId, guest.id);
  if (!access) notFound();

  const selected = isDateKey(date) ? date : todayKey();
  const unit = preferredWeightUnit(guest.preference);

  // Only team-wide programming is ranked; individual days are private to the athlete and coach.
  const day = await prisma.programmingDay.findFirst({
    where: {
      teamId,
      date: dateKeyToDate(selected),
      assigneeId: null,
      publishedAt: { not: null },
    },
    include: {
      blocks: {
        where: { workoutId: { not: null } },
        orderBy: { order: "asc" },
        include: { workout: { select: { scoreType: true } } },
      },
    },
  });
  const blocks = day?.blocks ?? [];
  const results = await resultsForBlocks(blocks.map((b) => b.id));

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-2">
        <Link
          href={`/box/${teamId}?date=${selected}`}
          aria-label="Volver"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">
            {access.team.name}
          </p>
          <h1 className="font-display text-3xl uppercase text-text-primary">
            Ranking
          </h1>
          <p className="text-sm capitalize text-text-muted">
            {formatDateKeyEs(selected)}
          </p>
        </div>
      </header>

      {blocks.length === 0 ? (
        <EmptyState
          title="Sin WOD puntuable"
          description="Este día no tiene bloques con puntuación."
        />
      ) : (
        blocks.map((block) => (
          <Leaderboard
            key={block.id}
            id={block.id}
            title={block.title}
            scoreType={block.workout!.scoreType as ScoreType}
            viewerId={guest.id}
            weightUnit={unit}
            entries={results
              .filter(
                (r) =>
                  r.programmingBlockId === block.id &&
                  (r.guestId === guest.id ||
                    (r.guest.preference?.showOnLeaderboard ?? true)),
              )
              .map((r) => ({
                ...r,
                resultId: r.id,
                profileId: r.guestId,
                alias: r.guest.alias,
              }))}
          />
        ))
      )}

      <p className="text-center text-xs text-text-muted">
        Puedes ocultarte del ranking en Configuración.
      </p>
    </div>
  );
}
