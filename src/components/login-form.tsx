"use client";

import { useActionState } from "react";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { sendLoginCode, verifyLoginCode } from "@/lib/actions/auth";

type State = { error?: string; sentTo?: string } | null;

/** `codeEntry` needs the Supabase email template to include {{ .Token }}; otherwise only the link works. */
export function LoginForm({
  next,
  codeEntry,
}: {
  next: string;
  codeEntry: boolean;
}) {
  const [sendState, send, sending] = useActionState<State, FormData>(
    sendLoginCode,
    null,
  );
  const [verifyState, verify, verifying] = useActionState<State, FormData>(
    verifyLoginCode,
    null,
  );
  const sentTo = verifyState?.sentTo ?? sendState?.sentTo;

  if (!sentTo) {
    return (
      <form action={send} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="tu@correo.com"
          />
        </div>
        {sendState?.error ? (
          <p role="alert" className="text-sm text-danger">
            {sendState.error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? "Enviando…" : "Enviar código"}
        </Button>
      </form>
    );
  }

  if (!codeEntry) {
    return (
      <div role="status" className="space-y-2 text-sm text-text-secondary">
        <p>
          Enviamos un enlace a{" "}
          <strong className="text-text-primary">{sentTo}</strong>.
        </p>
        <p>
          Ábrelo en este mismo navegador para entrar. Si no llega, revisa la
          carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={verify} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="email" value={sentTo} />
      <p className="text-sm text-text-secondary">
        Enviamos un código y un enlace a{" "}
        <strong className="text-text-primary">{sentTo}</strong>. Escribe el
        código o abre el enlace en este dispositivo.
      </p>
      <div>
        <Label htmlFor="token">Código</Label>
        <Input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          className="text-center font-display text-2xl tracking-[0.4em]"
        />
      </div>
      {verifyState?.error ? (
        <p role="alert" className="text-sm text-danger">
          {verifyState.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={verifying}>
        {verifying ? "Verificando…" : "Entrar"}
      </Button>
    </form>
  );
}
