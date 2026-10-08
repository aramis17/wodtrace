import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountRequired } from "@/components/account-required";
import { JoinTeamForm } from "@/components/team-forms";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { getMemberships, ownsAnyTeam } from "@/lib/teams";
import { TEAM_KIND_LABELS } from "@/lib/team-rules";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mi box" };

export default async function BoxPage() {
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  if (!guest.userId) {
    return (
      <div className="space-y-5">
        <Header />
        <AccountRequired
          next="/box"
          description="Crea tu cuenta para unirte a tu box o a tu coach y ver la programación que te asignen."
        />
      </div>
    );
  }

  const [memberships, isOwner] = await Promise.all([
    getMemberships(guest.id),
    ownsAnyTeam(guest.id),
  ]);

  return (
    <div className="space-y-6">
      <Header />

      {memberships.length > 0 ? (
        <ul className="space-y-2">
          {memberships.map((m) => {
            const active = m.status === "ACTIVE";
            const body = (
              <Card
                className={
                  active
                    ? "flex items-center gap-3 transition-colors hover:border-primary/40"
                    : "flex items-center gap-3 opacity-80"
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">
                    {m.team.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {TEAM_KIND_LABELS[m.team.kind]} · {m.team.owner.alias}
                  </p>
                </div>
                {active ? (
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                ) : (
                  <Badge tone="gold">Pendiente</Badge>
                )}
              </Card>
            );
            return (
              <li key={m.id}>
                {active ? <Link href={`/box/${m.teamId}`}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      ) : null}

      <Card className="space-y-3">
        <CardTitle>Unirme a un box o coach</CardTitle>
        <p className="text-sm text-text-muted">
          Pide el código a tu box o a tu coach. Verás la programación en cuanto
          acepten tu solicitud.
        </p>
        <JoinTeamForm />
      </Card>

      <Link
        href="/coach"
        className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-text-secondary hover:bg-card"
      >
        <ClipboardList className="h-5 w-5" />
        {isOwner ? "Ir a mi panel de coach" : "¿Eres coach o tienes un box? Programa aquí"}
        <ChevronRight className="ml-auto h-4 w-4 text-text-muted" />
      </Link>
    </div>
  );
}

function Header() {
  return (
    <header>
      <h1 className="font-display text-3xl uppercase text-text-primary">
        Mi box
      </h1>
      <p className="text-sm text-text-muted">
        Programación de tu box y de tu coach
      </p>
    </header>
  );
}
