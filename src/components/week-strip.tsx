import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDaysToKey,
  dateKeyToDate,
  formatDateKeyEs,
  weekKeys,
} from "@/lib/team-rules";
import { cn } from "@/lib/utils";

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

export type DayMark = "published" | "draft";

/**
 * Monday-first week selector. `hrefFor` builds each day's link so the same strip
 * serves the athlete calendar and the owner's editor.
 */
export function WeekStrip({
  selected,
  today,
  marks,
  hrefFor,
}: {
  selected: string;
  today: string;
  marks: Map<string, DayMark>;
  hrefFor: (dateKey: string) => string;
}) {
  const week = weekKeys(selected);
  const month = formatDateKeyEs(week[0], { month: "long", year: "numeric" });

  return (
    <nav aria-label="Semana" className="space-y-2">
      <div className="flex items-center justify-between">
        <Link
          href={hrefFor(addDaysToKey(week[0], -7))}
          aria-label="Semana anterior"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm font-medium capitalize text-text-primary">
          {month}
        </span>
        <Link
          href={hrefFor(addDaysToKey(week[0], 7))}
          aria-label="Semana siguiente"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {week.map((key, i) => {
          const isSelected = key === selected;
          const mark = marks.get(key);
          return (
            <li key={key}>
              <Link
                href={hrefFor(key)}
                aria-current={isSelected ? "date" : undefined}
                aria-label={`${formatDateKeyEs(key)}${mark === "published" ? ", con programación" : mark === "draft" ? ", borrador" : ""}`}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs transition-colors",
                  isSelected
                    ? "border-primary bg-primary/15 text-text-primary"
                    : "border-border bg-card text-text-secondary hover:border-primary/40",
                  key === today && !isSelected && "border-text-muted",
                )}
              >
                <span className="text-text-muted">{DAY_LETTERS[i]}</span>
                <span className="font-display text-lg leading-none">
                  {dateKeyToDate(key).getUTCDate()}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    mark === "published" && "bg-primary",
                    mark === "draft" && "border border-text-muted",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
