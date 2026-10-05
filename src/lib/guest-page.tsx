import { getGuestOrNull } from "./guest";
import { EmptyState } from "@/components/ui/empty-state";

export async function withGuest() {
  return getGuestOrNull();
}

export function GuestLoading() {
  return (
    <EmptyState
      title="Preparando tu perfil"
      description="Creando sesión invitada en este navegador…"
    />
  );
}
