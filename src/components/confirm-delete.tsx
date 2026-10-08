"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { notifyResult, notifyThrown, type ActionResult } from "./toaster";

export function ConfirmDelete({
  action,
  label = "Eliminar",
  successMessage = "Eliminado",
}: {
  action: () => Promise<ActionResult>;
  label?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Confirmar eliminación">
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              if (notifyResult(await action(), successMessage)) router.refresh();
            } catch (e) {
              notifyThrown(e);
            }
            setOpen(false);
          })
        }
      >
        {pending ? "…" : "Confirmar"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
    </div>
  );
}
