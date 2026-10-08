"use client";

import { Star } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { notifyThrown } from "./toaster";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  favorited,
  onToggle,
  className,
}: {
  favorited: boolean;
  onToggle: () => Promise<void>;
  className?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorited}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await onToggle();
            toast.success(favorited ? "Quitado de favoritos" : "Añadido a favoritos");
          } catch (e) {
            notifyThrown(e);
          }
        })
      }
      className={cn(
        "inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl transition-colors",
        favorited ? "text-gold" : "text-text-muted hover:text-gold",
        className,
      )}
    >
      <Star className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
    </button>
  );
}
