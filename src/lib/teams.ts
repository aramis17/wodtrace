import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { requireAccount } from "./guest";
import {
  canViewProgramming,
  dateKeyToDate,
  selectDaysForAthlete,
} from "./team-rules";

export async function getMemberships(profileId: string) {
  return prisma.teamMember.findMany({
    where: { profileId },
    include: { team: { include: { owner: { select: { alias: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOwnedTeams(profileId: string) {
  return prisma.team.findMany({
    where: { ownerId: profileId },
    include: {
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function ownsAnyTeam(profileId: string) {
  return (await prisma.team.count({ where: { ownerId: profileId } })) > 0;
}

/** Throws unless the signed-in profile owns the team. */
export async function requireTeamOwner(teamId: string) {
  const profile = await requireAccount();
  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: profile.id },
  });
  if (!team) throw new Error("No tienes permiso sobre este equipo.");
  return { profile, team };
}

/** The team plus the viewer's relationship to it, or null if they may not see its programming. */
export async function getTeamForViewer(teamId: string, profileId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_profileId: { teamId, profileId } },
  });
  if (!canViewProgramming(team, profileId, membership)) return null;
  return { team, membership, isOwner: team.ownerId === profileId };
}

/**
 * Workouts a profile may open and log: seeds, its own custom WODs, WODs of teams it
 * owns, and team WODs programmed for it (published, team-wide or assigned to it).
 */
export function visibleWorkoutWhere(profileId: string): Prisma.WorkoutWhereInput {
  return {
    OR: [
      { isSeed: true },
      { guestId: profileId },
      { team: { ownerId: profileId } },
      {
        team: {
          members: { some: { profileId, status: "ACTIVE" } },
        },
        block: {
          day: {
            publishedAt: { not: null },
            OR: [{ assigneeId: null }, { assigneeId: profileId }],
          },
        },
      },
    ],
  };
}

const dayInclude = {
  team: { select: { id: true, name: true, kind: true } },
  blocks: {
    orderBy: { order: "asc" },
    include: { workout: true },
  },
} satisfies Prisma.ProgrammingDayInclude;

export type ProgrammingDayWithBlocks = Prisma.ProgrammingDayGetPayload<{
  include: typeof dayInclude;
}>;

/** Published programming for an athlete on a date, across every team where they are active. */
export async function programmingForAthlete(
  profileId: string,
  dateKey: string,
  teamId?: string,
): Promise<ProgrammingDayWithBlocks[]> {
  const days = await prisma.programmingDay.findMany({
    where: {
      date: dateKeyToDate(dateKey),
      ...(teamId ? { teamId } : {}),
      // Owners preview what their students see.
      team: {
        OR: [
          { members: { some: { profileId, status: "ACTIVE" } } },
          { ownerId: profileId },
        ],
      },
      publishedAt: { not: null },
      OR: [{ assigneeId: null }, { assigneeId: profileId }],
    },
    include: dayInclude,
    orderBy: [{ team: { name: "asc" } }, { assigneeId: "asc" }],
  });
  return selectDaysForAthlete(days, profileId);
}

/** Dates in [from, to] that have published programming for the athlete in a team. */
export async function programmedDateKeys(
  profileId: string,
  teamId: string,
  fromKey: string,
  toKey: string,
) {
  const days = await prisma.programmingDay.findMany({
    where: {
      teamId,
      date: { gte: dateKeyToDate(fromKey), lte: dateKeyToDate(toKey) },
      publishedAt: { not: null },
      OR: [{ assigneeId: null }, { assigneeId: profileId }],
    },
    select: { date: true },
  });
  return new Set(days.map((d) => d.date.toISOString().slice(0, 10)));
}

export { dayInclude };

/** Results logged against the given blocks, with the athlete's alias and leaderboard preference. */
export async function resultsForBlocks(blockIds: string[]) {
  if (blockIds.length === 0) return [];
  return prisma.workoutResult.findMany({
    where: { programmingBlockId: { in: blockIds } },
    include: {
      guest: {
        select: {
          alias: true,
          preference: { select: { showOnLeaderboard: true } },
        },
      },
    },
  });
}
