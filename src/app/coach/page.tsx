import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountRequired } from "@/components/account-required";
import { CreateTeamForm } from "@/components/team-forms";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { getOwnedTeams } from "@/lib/teams";
import { TEAM_KIND_LABELS } from "@/lib/team-rules";

export const dynamic = "force-dynamic";

export const metadata = { title: "Panel de coach" };

export default async function CoachPage() {
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const header = (
    <header>
      <h1 className="font-display text-3xl uppercase text-text-primary">
        Panel de coach
      </h1>
      <p className="text-sm text-text-muted">
        Programa el día para tu box o para tus atletas
      </p>
    </header>
  );

  if (!guest.userId) {
    return (
      <div className="space-y-5">
        {header}
        <AccountRequired
          next="/coach"
          description="Necesitas una cuenta para crear tu box o tu equipo de coach y publicar programación."
        />
      </div>
    );
  }

  const teams = await getOwnedTeams(guest.id);

  return (
    <div className="space-y-6">
      {header}

      {teams.length > 0 ? (
        <ul className="space-y-2">
          {teams.map((t) => (
            <li key={t.id}>
              <Link href={`/coach/${t.id}`}>
                <Card className="flex items-center gap-3 transition-colors hover:border-primary/40">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text-primary">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t._count.members}{" "}
                      {t._count.members === 1 ? "alumno" : "alumnos"}
                    </p>
                  </div>
                  <Badge tone={t.kind === "BOX" ? "primary" : "info"}>
                    {TEAM_KIND_LABELS[t.kind]}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <Card className="space-y-3">
        <CardTitle>{teams.length > 0 ? "Crear otro" : "Crear mi box o equipo"}</CardTitle>
        <CreateTeamForm />
      </Card>
    </div>
  );
}
