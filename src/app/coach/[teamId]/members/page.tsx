import { notFound } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import {
  approveMember,
  regenerateJoinCode,
  removeMember,
} from "@/lib/actions/teams";
import { formatDateEs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamMembersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: guest.id },
    include: {
      members: {
        include: { profile: { select: { alias: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!team) notFound();

  const pending = team.members.filter((m) => m.status === "PENDING");
  const active = team.members.filter((m) => m.status === "ACTIVE");

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <CardTitle>Código de invitación</CardTitle>
        <p className="text-sm text-text-muted">
          Compártelo con tus {team.kind === "BOX" ? "alumnos" : "atletas"}. Lo
          escriben en <strong className="text-text-secondary">Mi box</strong> y
          tú los aceptas aquí.
        </p>
        <div className="flex items-center gap-3">
          <p
            className="flex-1 rounded-xl bg-surface py-3 text-center font-display text-4xl tracking-[0.3em] text-text-primary select-all"
            aria-label={`Código ${team.joinCode.split("").join(" ")}`}
          >
            {team.joinCode}
          </p>
          <ActionForm
            action={regenerateJoinCode}
            successMessage="Código nuevo generado"
            confirmMessage="¿Generar un código nuevo? El actual dejará de funcionar."
          >
            <input type="hidden" name="teamId" value={teamId} />
            <SubmitButton variant="secondary" size="icon" aria-label="Generar código nuevo">
              <RefreshCw className="h-5 w-5" />
            </SubmitButton>
          </ActionForm>
        </div>
      </Card>

      {pending.length > 0 ? (
        <section className="space-y-2" aria-labelledby="pending">
          <h2 id="pending" className="text-sm font-semibold text-gold">
            Solicitudes pendientes ({pending.length})
          </h2>
          {pending.map((m) => (
            <Card key={m.id} className="flex flex-wrap items-center gap-3">
              <MemberInfo alias={m.profile.alias} email={m.profile.email} />
              <div className="flex gap-2">
                <ActionForm action={removeMember} successMessage="Solicitud rechazada">
                  <input type="hidden" name="teamId" value={teamId} />
                  <input type="hidden" name="memberId" value={m.id} />
                  <SubmitButton variant="ghost" size="sm">
                    Rechazar
                  </SubmitButton>
                </ActionForm>
                <ActionForm action={approveMember} successMessage="Alumno aceptado">
                  <input type="hidden" name="teamId" value={teamId} />
                  <input type="hidden" name="memberId" value={m.id} />
                  <SubmitButton size="sm">Aceptar</SubmitButton>
                </ActionForm>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="space-y-2" aria-labelledby="active">
        <h2 id="active" className="text-sm font-semibold text-text-primary">
          {team.kind === "BOX" ? "Alumnos" : "Atletas"} ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyState
            title="Aún nadie"
            description="Comparte el código de invitación para empezar."
          />
        ) : (
          active.map((m) => (
            <Card key={m.id} className="flex items-center gap-3">
              <MemberInfo
                alias={m.profile.alias}
                email={m.profile.email}
                since={m.joinedAt}
              />
              <ActionForm
                action={removeMember}
                successMessage="Alumno quitado"
                confirmMessage={`¿Quitar a ${m.profile.alias} del equipo?`}
              >
                <input type="hidden" name="teamId" value={teamId} />
                <input type="hidden" name="memberId" value={m.id} />
                <SubmitButton variant="ghost" size="sm">
                  Quitar
                </SubmitButton>
              </ActionForm>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function MemberInfo({
  alias,
  email,
  since,
}: {
  alias: string;
  email: string | null;
  since?: Date | null;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-text-primary">{alias}</p>
      <p className="truncate text-xs text-text-muted">
        {email}
        {since ? ` · desde ${formatDateEs(since)}` : ""}
      </p>
    </div>
  );
}
