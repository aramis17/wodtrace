import Link from "next/link";
import { ListOrdered, PenLine } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatScore } from "@/lib/scoring";
import { BLOCK_KIND_LABELS } from "@/lib/team-rules";
import type { ProgrammingDayWithBlocks } from "@/lib/teams";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

export interface MyBlockResult {
  timeSeconds: number | null;
  reps: number | null;
  weightKg: number | null;
  rounds: number | null;
  extraReps: number | null;
  customValue: string | null;
  scaling: "RX" | "SCALED";
}

/** Read-only programming for athletes, with log and leaderboard shortcuts on scored blocks. */
export function ProgrammingDayView({
  day,
  dateKey,
  myResults,
  weightUnit,
  returnTo,
}: {
  day: ProgrammingDayWithBlocks;
  dateKey: string;
  myResults: Map<string, MyBlockResult>;
  weightUnit: "KG" | "LB";
  returnTo: string;
}) {
  return (
    <section className="space-y-3" aria-label={day.title ?? "Programación"}>
      {day.assigneeId ? (
        <Badge tone="info">Programación individual</Badge>
      ) : null}
      {day.title ? (
        <h2 className="font-display text-2xl uppercase text-text-primary">
          {day.title}
        </h2>
      ) : null}
      {day.notes ? (
        <p className="whitespace-pre-line text-sm text-text-secondary">
          {day.notes}
        </p>
      ) : null}

      <ol className="space-y-3">
        {day.blocks.map((block) => {
          const mine = myResults.get(block.id);
          const scoreType = block.workout?.scoreType as ScoreType | undefined;
          return (
            <li key={block.id}>
              <Card className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
                      {BLOCK_KIND_LABELS[block.kind]}
                    </p>
                    <h3 className="font-display text-xl uppercase text-text-primary">
                      {block.title}
                    </h3>
                  </div>
                  {scoreType ? (
                    <Badge tone="muted">{SCORE_TYPE_LABELS[scoreType]}</Badge>
                  ) : null}
                </div>
                {block.content ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                    {block.content}
                  </p>
                ) : null}

                {block.workout && scoreType ? (
                  <div className="space-y-2 border-t border-border pt-3">
                    {mine ? (
                      <p className="text-sm text-text-secondary">
                        Tu resultado:{" "}
                        <strong className="font-display text-lg text-text-primary">
                          {formatScore(scoreType, mine, { weightUnit }).primary}
                        </strong>{" "}
                        <span className="text-text-muted">
                          · {mine.scaling === "RX" ? "Rx" : "Escalado"}
                        </span>
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/wods/${block.workout.id}/log?from=${encodeURIComponent(returnTo)}`}
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover"
                      >
                        <PenLine className="h-4 w-4" />
                        {mine ? "Registrar otro" : "Registrar resultado"}
                      </Link>
                      {!day.assigneeId ? (
                        <Link
                          href={`/box/${day.teamId}/leaderboard?date=${dateKey}#${block.id}`}
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-text-primary hover:bg-surface"
                        >
                          <ListOrdered className="h-4 w-4" />
                          Ranking
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
