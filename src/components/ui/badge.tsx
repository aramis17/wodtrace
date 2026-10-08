import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Tone = "success" | "info" | "gold" | "primary" | "muted";

const tones: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  gold: "bg-gold/12 text-gold",
  primary: "bg-primary/12 text-primary",
  muted: "bg-border/40 text-text-muted",
};

export function Badge({
  tone = "muted",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
