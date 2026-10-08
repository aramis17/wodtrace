import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionForm, SubmitButton } from "@/components/action-form";
import {
  ProgrammingDayView,
  type MyBlockResult,
} from "@/components/programming-day-view";
import { WeekStrip, type DayMark } from "@/components/week-strip";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import {
  getTeamForViewer,
  programmedDateKeys,
  programmingForAthlete,
} from "@/lib/teams";
import {
  formatDateKeyEs,
  isDateKey,
  TEAM_KIND_LABELS,
  todayKey,
  weekKeys,
} from "@/lib/team-rules";
import { leaveTeam } from "@/lib/actions/teams";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function TeamProgrammingPage({
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
  const { team, isOwner } = access;

  const today = todayKey();
  const selected = isDateKey(date) ? date : today;
  const week = weekKeys(selected);
  const unit = preferredWeightUnit(guest.preference);
  const returnTo = `/box/${teamId}?date=${selected}`;

  const [days, programmed] = await Promise.all([
    programmingForAthlete(guest.id, selected, teamId),
    programmedDateKeys(guest.id, teamId, week[0], week[6]),
  ]);

  const blockIds = days.flatMap((d) => d.blocks.map((b) => b.id));
  const results = blockIds.length
    ? await prisma.workoutResult.findMany({
        where: { guestId: guest.id, programmingBlockId: { in: blockIds } },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const myResults = new Map<string, MyBlockResult>();
  for (const r of results) {
    if (r.programmingBlockId && !myResults.has(r.programmingBlockId)) {
      myResults.set(r.programmingBlockId, r);
    }
  }

  const marks = new Map<string, DayMark>(
    [...programmed].map((k) => [k, "published"]),
  );
  const hasScored = days.some(
    (d) => !d.assigneeId && d.blocks.some((b) => b.workout),
  );

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-2">
        <Link
          href="/box"
          aria-label="Volver"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            {TEAM_KIND_LABELS[team.kind]}
          </p>
          <h1 className="truncate font-display text-3xl uppercase text-text-primary">
            {team.name}
          </h1>
        </div>
      </header>

      <WeekStrip
        selected={selected}
        today={today}
        marks={marks}
        hrefFor={(k) => `/box/${teamId}?date=${k}`}
      />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold capitalize text-text-primary">
          {selected === today ? "Hoy · " : ""}
          {formatDateKeyEs(selected)}
        </h2>
        {hasScored ? (
          <Link
            href={`/box/${teamId}/leaderboard?date=${selected}`}
            className="inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <ListOrdered className="h-4 w-4" />
            Ranking del día
          </Link>
        ) : null}
      </div>

      {days.length === 0 ? (
        <EmptyState
          title="Sin programación"
          description={
            isOwner
              ? "Aún no has publicado nada para este día."
              : "Tu coach aún no ha publicado nada para este día."
          }
          action={
            isOwner ? (
              <Link
                href={`/coach/${teamId}?date=${selected}`}
                className="text-sm font-semibold text-primary"
              >
                Programar este día
              </Link>
            ) : undefined
          }
        />
      ) : (
        days.map((day) => (
          <ProgrammingDayView
            key={day.id}
            day={day}
            dateKey={selected}
            myResults={myResults}
            weightUnit={unit}
            returnTo={returnTo}
          />
        ))
      )}

      {!isOwner ? (
        <ActionForm
          action={leaveTeam}
          confirmMessage={`¿Salir de ${team.name}? Dejarás de ver su programación.`}
          className="pt-4"
        >
          <input type="hidden" name="teamId" value={teamId} />
          <SubmitButton variant="ghost" size="sm" className="w-full">
            Salir de {team.name}
          </SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
