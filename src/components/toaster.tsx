"use client";

import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "next-themes";

export type ActionResult =
  | { error?: string; message?: string; redirectTo?: string }
  | void
  | undefined;

/** App-wide toasts, styled with Forge Dark tokens so they follow the light/dark theme. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-center"
      offset={{ top: "max(16px, env(safe-area-inset-top))" }}
      mobileOffset={{ top: "max(12px, env(safe-area-inset-top))" }}
      closeButton
      containerAriaLabel="Notificaciones"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
        classNames: {
          success: "[&_[data-icon]]:text-success",
          error: "[&_[data-icon]]:text-danger",
          description: "!text-text-secondary",
        },
      }}
    />
  );
}

const GENERIC_ERROR = "Algo salió mal. Inténtalo de nuevo.";

/**
 * Turns a server action's `{ error } | { message }` result into a toast.
 * Returns true when the action succeeded.
 */
export function notifyResult(
  result: ActionResult,
  successMessage?: string | null,
): boolean {
  if (result && "error" in result && result.error) {
    toast.error(result.error);
    return false;
  }
  const message =
    (result && "message" in result && result.message) || successMessage;
  if (message) toast.success(message);
  return true;
}

/** Thrown errors (e.g. expired session) still reach the user instead of failing silently. */
export function notifyThrown(e: unknown) {
  console.error(e);
  toast.error(e instanceof Error && e.message ? e.message : GENERIC_ERROR);
}
