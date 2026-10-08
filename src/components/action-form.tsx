"use client";

import {
  createContext,
  useContext,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { notifyResult, notifyThrown, type ActionResult } from "./toaster";

const PendingContext = createContext(false);

/**
 * Form for server actions that return `{ error }` / `{ message }` / `{ redirectTo }`
 * instead of throwing. Outcomes are shown as toasts. Submitting through onSubmit
 * (not `action=`) keeps the user's input when the action reports an error.
 */
export function ActionForm({
  action,
  children,
  className,
  confirmMessage,
  successMessage = "Guardado",
  resetOnSuccess = false,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
  /** Toast shown when the action succeeds without its own message; null for none. */
  successMessage?: string | null;
  resetOnSuccess?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const form = e.currentTarget;
    const formData = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    start(async () => {
      try {
        const result = await action(formData);
        if (!notifyResult(result, successMessage)) return;
        if (resetOnSuccess) form.reset();
        if (result && "redirectTo" in result && result.redirectTo) {
          router.push(result.redirectTo);
        }
        router.refresh();
      } catch (err) {
        notifyThrown(err);
      }
    });
  }

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className={className} aria-busy={pending}>
        {children}
      </form>
    </PendingContext.Provider>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...rest
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const pending = useContext(PendingContext);
  return (
    <Button type="submit" disabled={pending || disabled} {...rest}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
