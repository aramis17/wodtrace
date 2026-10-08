import { Card } from "./ui/card";
import { formatScore } from "@/lib/scoring";
import {
  rankLeaderboard,
  type LeaderboardInput,
} from "@/lib/team-rules";
import type { ScoreType } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCALING_LABELS = { RX: "Rx", SCALED: "Escalado" } as const;

/** One scored block's ranking, split into Rx and Escalado. */
export function Leaderboard({
  id,
  title,
  scoreType,
  entries,
  viewerId,
  weightUnit,
}: {
  id?: string;
  title: string;
  scoreType: ScoreType;
  entries: LeaderboardInput[];
  viewerId: string;
  weightUnit: "KG" | "LB";
}) {
  const board = rankLeaderboard(scoreType, entries);
  const empty = board.RX.length === 0 && board.SCALED.length === 0;

  return (
    <section id={id} aria-label={`Ranking ${title}`} className="scroll-mt-6 space-y-3">
      <h2 className="font-display text-2xl uppercase text-text-primary">
        {title}
      </h2>
      {empty ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
          Nadie ha registrado todavía.
        </p>
      ) : null}
      {(["RX", "SCALED"] as const).map((scaling) =>
        board[scaling].length > 0 ? (
          <Card key={scaling} className="p-2">
            <h3 className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {SCALING_LABELS[scaling]}
            </h3>
            <ol>
              {board[scaling].map((row) => {
                const score = formatScore(scoreType, row, { weightUnit });
                const isMe = row.profileId === viewerId;
                return (
                  <li
                    key={row.resultId}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-2",
                      isMe && "bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 text-center font-display text-lg",
                        row.rank === 1 ? "text-gold" : "text-text-muted",
                      )}
                    >
                      {row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                      {row.alias}
                      {isMe ? (
                        <span className="ml-1.5 text-xs text-text-muted">(tú)</span>
                      ) : null}
                    </span>
                    <span className="text-right">
                      <span className="font-display text-lg text-text-primary">
                        {score.primary}
                      </span>
                      {score.secondary ? (
                        <span className="block text-xs text-text-muted">
                          {score.secondary}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>
        ) : null,
      )}
    </section>
  );
}
