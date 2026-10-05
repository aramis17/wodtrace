"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/button";

export function ConfirmDelete({
  action,
  label = "Eliminar",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
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
            await action();
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
