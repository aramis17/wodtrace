import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { BlockFields } from "@/components/block-fields";
import { WeekStrip, type DayMark } from "@/components/week-strip";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import {
  addDaysToKey,
  BLOCK_KIND_LABELS,
  canAssignIndividually,
  dateKeyToDate,
  dateToKey,
  formatDateKeyEs,
  isDateKey,
  todayKey,
  weekKeys,
} from "@/lib/team-rules";
import {
  addBlock,
  copyDay,
  deleteBlock,
  moveBlock,
  saveDayDetails,
  setDayPublished,
  updateBlock,
} from "@/lib/actions/programming";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoachProgrammingPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ date?: string; athlete?: string }>;
}) {
  const { teamId } = await params;
  const { date, athlete } = await searchParams;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: guest.id },
  });
  if (!team) notFound();

  const today = todayKey();
  const selected = isDateKey(date) ? date : today;
  const week = weekKeys(selected);
  const individual = canAssignIndividually(team.kind);

  const athletes = individual
    ? await prisma.teamMember.findMany({
        where: { teamId, status: "ACTIVE" },
        include: { profile: { select: { id: true, alias: true } } },
        orderBy: { profile: { alias: "asc" } },
      })
    : [];
  const assignee = athletes.find((m) => m.profileId === athlete)?.profile ?? null;
  const assigneeId = assignee?.id ?? null;

  const hrefFor = (k: string, who: string | null = assigneeId) =>
    `/coach/${teamId}?date=${k}${who ? `&athlete=${who}` : ""}`;

  const [day, weekDays] = await Promise.all([
    prisma.programmingDay.findFirst({
      where: { teamId, date: dateKeyToDate(selected), assigneeId },
      include: {
        blocks: {
          orderBy: { order: "asc" },
          include: {
            workout: { include: { _count: { select: { results: true } } } },
          },
        },
      },
    }),
    prisma.programmingDay.findMany({
      where: {
        teamId,
        assigneeId,
        date: { gte: dateKeyToDate(week[0]), lte: dateKeyToDate(week[6]) },
        blocks: { some: {} },
      },
      select: { date: true, publishedAt: true },
    }),
  ]);

  const marks = new Map<string, DayMark>(
    weekDays.map((d) => [dateToKey(d.date), d.publishedAt ? "published" : "draft"]),
  );
  const blocks = day?.blocks ?? [];
  const hidden = (
    <>
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="date" value={selected} />
      {assigneeId ? <input type="hidden" name="assigneeId" value={assigneeId} /> : null}
    </>
  );

  return (
    // Keyed so uncontrolled fields reset when switching day or athlete.
    <div key={`${selected}-${assigneeId ?? "team"}`} className="space-y-5">
      {individual ? (
        <nav aria-label="Para quién" className="-mx-4 overflow-x-auto px-4">
          <ul className="flex gap-2">
            <li>
              <AudienceChip href={hrefFor(selected, null)} active={!assigneeId}>
                Todo el equipo
              </AudienceChip>
            </li>
            {athletes.map((m) => (
              <li key={m.id}>
                <AudienceChip
                  href={hrefFor(selected, m.profileId)}
                  active={assigneeId === m.profileId}
                >
                  {m.profile.alias}
                </AudienceChip>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <WeekStrip selected={selected} today={today} marks={marks} hrefFor={hrefFor} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold capitalize text-text-primary">
          {formatDateKeyEs(selected)}
          {assignee ? (
            <span className="normal-case text-text-muted"> · solo {assignee.alias}</span>
          ) : null}
        </h2>
        {day && blocks.length > 0 ? (
          day.publishedAt ? (
            <Badge tone="success">Publicado</Badge>
          ) : (
            <Badge tone="gold">Borrador</Badge>
          )
        ) : null}
      </div>

      <Card className="space-y-3">
        <CardTitle>Día</CardTitle>
        <ActionForm
          action={saveDayDetails}
          successMessage="Día guardado"
          className="space-y-3"
        >
          {hidden}
          <div>
            <Label htmlFor="day-title">Título (opcional)</Label>
            <Input
              id="day-title"
              name="title"
              defaultValue={day?.title ?? ""}
              placeholder="Ej. Semana 3 · Día de fuerza"
            />
          </div>
          <div>
            <Label htmlFor="day-notes">Notas para los atletas</Label>
            <Textarea
              id="day-notes"
              name="notes"
              rows={2}
              defaultValue={day?.notes ?? ""}
            />
          </div>
          <SubmitButton variant="secondary" size="sm" pendingLabel="Guardando…">
            Guardar
          </SubmitButton>
        </ActionForm>
      </Card>

      {blocks.length > 0 ? (
        <ol className="space-y-3">
          {blocks.map((block, i) => {
            const results = block.workout?._count.results ?? 0;
            return (
              <li key={block.id}>
                <Card className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
                        {BLOCK_KIND_LABELS[block.kind]}
                        {block.workout ? (
                          <span className="ml-2 normal-case tracking-normal text-text-muted">
                            · {SCORE_TYPE_LABELS[block.workout.scoreType as ScoreType]}
                            {results > 0 ? ` · ${results} resultado${results === 1 ? "" : "s"}` : ""}
                          </span>
                        ) : null}
                      </p>
                      <h3 className="font-display text-xl uppercase text-text-primary">
                        {block.title}
                      </h3>
                    </div>
                    <div className="flex">
                      <ActionForm action={moveBlock} successMessage={null}>
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="direction" value="up" />
                        <SubmitButton
                          variant="ghost"
                          size="icon"
                          aria-label="Subir"
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                      <ActionForm action={moveBlock} successMessage={null}>
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="direction" value="down" />
                        <SubmitButton
                          variant="ghost"
                          size="icon"
                          aria-label="Bajar"
                          disabled={i === blocks.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                    </div>
                  </div>
                  {block.content ? (
                    <p className="whitespace-pre-line text-sm text-text-secondary">
                      {block.content}
                    </p>
                  ) : null}
                  <details className="group rounded-xl border border-border">
                    <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium text-text-secondary">
                      Editar bloque
                    </summary>
                    <div className="space-y-3 border-t border-border p-3">
                      <ActionForm
                        action={updateBlock}
                        successMessage="Bloque actualizado"
                        className="space-y-3"
                      >
                        <input type="hidden" name="blockId" value={block.id} />
                        <BlockFields
                          idPrefix={block.id}
                          kind={block.kind}
                          title={block.title}
                          content={block.content}
                          scoreType={(block.workout?.scoreType as ScoreType) ?? null}
                        />
                        <SubmitButton size="sm" className="w-full" pendingLabel="Guardando…">
                          Guardar bloque
                        </SubmitButton>
                      </ActionForm>
                      <ActionForm
                        action={deleteBlock}
                        successMessage="Bloque borrado"
                        confirmMessage={`¿Borrar "${block.title}"?`}
                      >
                        <input type="hidden" name="blockId" value={block.id} />
                        <SubmitButton variant="danger" size="sm" className="w-full">
                          <Trash2 className="h-4 w-4" />
                          Borrar bloque
                        </SubmitButton>
                      </ActionForm>
                    </div>
                  </details>
                </Card>
              </li>
            );
          })}
        </ol>
      ) : null}

      <Card className="space-y-3">
        <CardTitle>Añadir bloque</CardTitle>
        <ActionForm
          action={addBlock}
          successMessage="Bloque añadido"
          resetOnSuccess
          className="space-y-3"
        >
          {hidden}
          <BlockFields idPrefix="new" />
          <SubmitButton className="w-full" pendingLabel="Añadiendo…">
            Añadir bloque
          </SubmitButton>
        </ActionForm>
      </Card>

      {day && blocks.length > 0 ? (
        <Card className="space-y-4">
          <ActionForm
            action={setDayPublished}
            successMessage={
              day.publishedAt ? "Día pasado a borrador" : "Día publicado"
            }
          >
            <input type="hidden" name="dayId" value={day.id} />
            <input
              type="hidden"
              name="publish"
              value={day.publishedAt ? "false" : "true"}
            />
            <SubmitButton
              variant={day.publishedAt ? "secondary" : "primary"}
              className="w-full"
            >
              {day.publishedAt
                ? "Pasar a borrador"
                : assignee
                  ? `Publicar para ${assignee.alias}`
                  : "Publicar para el equipo"}
            </SubmitButton>
          </ActionForm>
          <ActionForm action={copyDay} className="flex items-end gap-2">
            <input type="hidden" name="dayId" value={day.id} />
            <div className="flex-1">
              <Label htmlFor="copy-target">Copiar este día a</Label>
              <Input
                id="copy-target"
                name="targetDate"
                type="date"
                required
                defaultValue={addDaysToKey(selected, 7)}
              />
            </div>
            <SubmitButton variant="secondary">Copiar</SubmitButton>
          </ActionForm>
        </Card>
      ) : null}

      {individual && athletes.length === 0 ? (
        <p className="text-center text-sm text-text-muted">
          Cuando aceptes atletas en{" "}
          <Link href={`/coach/${teamId}/members`} className="text-primary">
            Alumnos
          </Link>{" "}
          podrás programarles de forma individual.
        </p>
      ) : null}
    </div>
  );
}

function AudienceChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium",
        active
          ? "border-text-primary bg-text-primary text-background"
          : "border-border text-text-secondary hover:border-text-muted",
      )}
    >
      {children}
    </Link>
  );
}
