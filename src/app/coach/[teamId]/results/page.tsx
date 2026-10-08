import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Leaderboard } from "@/components/leaderboard";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { resultsForBlocks } from "@/lib/teams";
import {
  addDaysToKey,
  dateKeyToDate,
  formatDateKeyEs,
  isDateKey,
  todayKey,
} from "@/lib/team-rules";
import type { ScoreType } from "@/lib/types";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

/** Owner view of every athlete's results for the day, regardless of their leaderboard preference. */
export default async function TeamResultsPage({
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

  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: guest.id },
    select: { id: true },
  });
  if (!team) notFound();

  const selected = isDateKey(date) ? date : todayKey();
  const unit = preferredWeightUnit(guest.preference);

  const days = await prisma.programmingDay.findMany({
    where: { teamId, date: dateKeyToDate(selected) },
    include: {
      assignee: { select: { alias: true } },
      blocks: {
        where: { workoutId: { not: null } },
        orderBy: { order: "asc" },
        include: { workout: { select: { scoreType: true } } },
      },
    },
    orderBy: { assigneeId: { sort: "asc", nulls: "first" } },
  });
  const blocks = days.flatMap((d) =>
    d.blocks.map((b) => ({ ...b, assignee: d.assignee?.alias ?? null })),
  );
  const results = await resultsForBlocks(blocks.map((b) => b.id));
  const dayHref = (k: string) => `/coach/${teamId}/results?date=${k}`;

  return (
    <div className="space-y-5">
      <nav aria-label="Día" className="flex items-center justify-between">
        <Link
          href={dayHref(addDaysToKey(selected, -1))}
          aria-label="Día anterior"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-sm font-semibold capitalize text-text-primary">
          {formatDateKeyEs(selected)}
        </h2>
        <Link
          href={dayHref(addDaysToKey(selected, 1))}
          aria-label="Día siguiente"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </nav>

      {blocks.length === 0 ? (
        <EmptyState
          title="Sin bloques puntuables"
          description="Añade un bloque con puntuación en Programación para recibir resultados."
        />
      ) : (
        blocks.map((block) => (
          <div key={block.id} className="space-y-2">
            {block.assignee ? (
              <Badge tone="info">Individual · {block.assignee}</Badge>
            ) : null}
            <Leaderboard
              title={block.title}
              scoreType={block.workout!.scoreType as ScoreType}
              viewerId={guest.id}
              weightUnit={unit}
              entries={results
                .filter((r) => r.programmingBlockId === block.id)
                .map((r) => ({
                  ...r,
                  resultId: r.id,
                  profileId: r.guestId,
                  alias: r.guest.alias,
                }))}
            />
          </div>
        ))
      )}
    </div>
  );
}
