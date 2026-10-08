import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { TeamTabs } from "@/components/team-tabs";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { TEAM_KIND_LABELS } from "@/lib/team-rules";

export default async function CoachTeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;

  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: guest.id },
    include: {
      _count: { select: { members: { where: { status: "PENDING" } } } },
    },
  });
  if (!team) notFound();

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-2">
        <Link
          href="/coach"
          aria-label="Volver al panel"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            {TEAM_KIND_LABELS[team.kind]}
            {team._count.members > 0 ? (
              <span className="ml-2 text-gold">
                · {team._count.members} pendiente
                {team._count.members === 1 ? "" : "s"}
              </span>
            ) : null}
          </p>
          <h1 className="truncate font-display text-3xl uppercase text-text-primary">
            {team.name}
          </h1>
        </div>
        <Link
          href={`/box/${teamId}`}
          aria-label="Ver como alumno"
          title="Ver como alumno"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
        >
          <Eye className="h-5 w-5" />
        </Link>
      </header>
      <TeamTabs teamId={teamId} />
      {children}
    </div>
  );
}
