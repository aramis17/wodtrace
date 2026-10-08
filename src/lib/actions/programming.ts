"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAccount } from "@/lib/guest";
import { requireTeamOwner } from "@/lib/teams";
import {
  BLOCK_KIND_LABELS,
  canAssignIndividually,
  dateKeyToDate,
  isDateKey,
  type BlockKind,
} from "@/lib/team-rules";
import type { ScoreType } from "@/lib/types";

const SCORE_TYPES: ScoreType[] = ["TIME", "REPS_TIME", "WEIGHT", "AMRAP", "CUSTOM"];
const BLOCK_KINDS = Object.keys(BLOCK_KIND_LABELS) as BlockKind[];

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Algo salió mal";
}

function parseScoreType(value: FormDataEntryValue | null): ScoreType | null {
  return SCORE_TYPES.includes(value as ScoreType) ? (value as ScoreType) : null;
}

function parseBlockKind(value: FormDataEntryValue | null): BlockKind {
  return BLOCK_KINDS.includes(value as BlockKind) ? (value as BlockKind) : "OTHER";
}

function revalidateTeam(teamId: string) {
  revalidatePath(`/coach/${teamId}`, "layout");
  revalidatePath(`/box/${teamId}`, "layout");
  revalidatePath("/");
}

/** Validates the assignee for a team: must be an active student of a COACH team. */
async function resolveAssignee(
  team: { id: string; kind: "COACH" | "BOX" },
  raw: FormDataEntryValue | null,
) {
  const assigneeId = typeof raw === "string" && raw ? raw : null;
  if (!assigneeId) return null;
  if (!canAssignIndividually(team.kind)) {
    throw new Error("Un box programa el día para todos sus alumnos.");
  }
  const member = await prisma.teamMember.findUnique({
    where: { teamId_profileId: { teamId: team.id, profileId: assigneeId } },
  });
  if (member?.status !== "ACTIVE") throw new Error("Atleta no válido");
  return assigneeId;
}

/** One day per (team, date, assignee); Postgres can't enforce it with a NULL assignee. */
async function findOrCreateDay(
  teamId: string,
  dateKey: string,
  assigneeId: string | null,
) {
  const date = dateKeyToDate(dateKey);
  const existing = await prisma.programmingDay.findFirst({
    where: { teamId, date, assigneeId },
  });
  if (existing) return existing;
  return prisma.programmingDay.create({ data: { teamId, date, assigneeId } });
}

/** Loads a block and checks the signed-in profile owns its team. */
async function requireOwnedBlock(blockId: string) {
  const profile = await requireAccount();
  const block = await prisma.programmingBlock.findFirst({
    where: { id: blockId, day: { team: { ownerId: profile.id } } },
    include: {
      day: { select: { id: true, teamId: true } },
      workout: { include: { _count: { select: { results: true } } } },
    },
  });
  if (!block) throw new Error("Bloque no encontrado");
  return block;
}

export async function saveDayDetails(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  const dateKey = String(formData.get("date") || "");
  try {
    const { team } = await requireTeamOwner(teamId);
    if (!isDateKey(dateKey)) return { error: "Fecha inválida" };
    const assigneeId = await resolveAssignee(team, formData.get("assigneeId"));
    const day = await findOrCreateDay(teamId, dateKey, assigneeId);
    await prisma.programmingDay.update({
      where: { id: day.id },
      data: {
        title: String(formData.get("title") || "").trim() || null,
        notes: String(formData.get("notes") || "").trim() || null,
      },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

export async function addBlock(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  const dateKey = String(formData.get("date") || "");
  try {
    const { team } = await requireTeamOwner(teamId);
    if (!isDateKey(dateKey)) return { error: "Fecha inválida" };
    const assigneeId = await resolveAssignee(team, formData.get("assigneeId"));
    const kind = parseBlockKind(formData.get("kind"));
    const title =
      String(formData.get("title") || "").trim() || BLOCK_KIND_LABELS[kind];
    const content = String(formData.get("content") || "").trim();
    const scoreType = parseScoreType(formData.get("scoreType"));

    const day = await findOrCreateDay(teamId, dateKey, assigneeId);
    const last = await prisma.programmingBlock.findFirst({
      where: { dayId: day.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await prisma.programmingBlock.create({
      data: {
        day: { connect: { id: day.id } },
        order: (last?.order ?? -1) + 1,
        kind,
        title,
        content,
        workout: scoreType
          ? {
              create: {
                name: title,
                description: content,
                scoreType,
                teamId,
              },
            }
          : undefined,
      },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

export async function updateBlock(formData: FormData) {
  const blockId = String(formData.get("blockId") || "");
  let teamId = "";
  try {
    const block = await requireOwnedBlock(blockId);
    teamId = block.day.teamId;
    const kind = parseBlockKind(formData.get("kind"));
    const title =
      String(formData.get("title") || "").trim() || BLOCK_KIND_LABELS[kind];
    const content = String(formData.get("content") || "").trim();
    const scoreType = parseScoreType(formData.get("scoreType"));
    const hasResults = (block.workout?._count.results ?? 0) > 0;

    if (block.workout && hasResults && scoreType !== block.workout.scoreType) {
      return {
        error: "Ya hay resultados registrados: no se puede cambiar la puntuación.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.programmingBlock.update({
        where: { id: blockId },
        data: { kind, title, content },
      });
      if (block.workout && scoreType) {
        await tx.workout.update({
          where: { id: block.workout.id },
          data: { name: title, description: content, scoreType },
        });
      } else if (block.workout && !scoreType) {
        await tx.workout.delete({ where: { id: block.workout.id } });
      } else if (!block.workout && scoreType) {
        await tx.programmingBlock.update({
          where: { id: blockId },
          data: {
            workout: {
              create: { name: title, description: content, scoreType, teamId },
            },
          },
        });
      }
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

export async function deleteBlock(formData: FormData) {
  const blockId = String(formData.get("blockId") || "");
  let teamId = "";
  try {
    const block = await requireOwnedBlock(blockId);
    teamId = block.day.teamId;
    if ((block.workout?._count.results ?? 0) > 0) {
      return {
        error: "Este bloque ya tiene resultados de tus atletas; no se puede borrar.",
      };
    }
    await prisma.$transaction(async (tx) => {
      await tx.programmingBlock.delete({ where: { id: blockId } });
      if (block.workout) {
        await tx.workout.delete({ where: { id: block.workout.id } });
      }
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

export async function moveBlock(formData: FormData) {
  const blockId = String(formData.get("blockId") || "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  let teamId = "";
  try {
    const block = await requireOwnedBlock(blockId);
    teamId = block.day.teamId;
    const neighbor = await prisma.programmingBlock.findFirst({
      where: {
        dayId: block.dayId,
        order: direction === "up" ? { lt: block.order } : { gt: block.order },
      },
      orderBy: { order: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbor) return { ok: true };
    await prisma.$transaction([
      prisma.programmingBlock.update({
        where: { id: block.id },
        data: { order: neighbor.order },
      }),
      prisma.programmingBlock.update({
        where: { id: neighbor.id },
        data: { order: block.order },
      }),
    ]);
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

export async function setDayPublished(formData: FormData) {
  const dayId = String(formData.get("dayId") || "");
  const publish = formData.get("publish") === "true";
  let teamId = "";
  try {
    const profile = await requireAccount();
    const day = await prisma.programmingDay.findFirst({
      where: { id: dayId, team: { ownerId: profile.id } },
      include: { _count: { select: { blocks: true } } },
    });
    if (!day) return { error: "Día no encontrado" };
    if (publish && day._count.blocks === 0) {
      return { error: "Añade al menos un bloque antes de publicar" };
    }
    teamId = day.teamId;
    await prisma.programmingDay.update({
      where: { id: dayId },
      data: { publishedAt: publish ? new Date() : null },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true };
}

/** Copies a day's blocks (as an unpublished draft) to another date for the same audience. */
export async function copyDay(formData: FormData) {
  const dayId = String(formData.get("dayId") || "");
  const targetKey = String(formData.get("targetDate") || "");
  let teamId = "";
  try {
    const profile = await requireAccount();
    if (!isDateKey(targetKey)) return { error: "Fecha destino inválida" };
    const day = await prisma.programmingDay.findFirst({
      where: { id: dayId, team: { ownerId: profile.id } },
      include: { blocks: { orderBy: { order: "asc" }, include: { workout: true } } },
    });
    if (!day) return { error: "Día no encontrado" };
    teamId = day.teamId;

    const target = await findOrCreateDay(day.teamId, targetKey, day.assigneeId);
    if (target.id === day.id) return { error: "Elige otra fecha" };
    const targetBlocks = await prisma.programmingBlock.count({
      where: { dayId: target.id },
    });
    if (targetBlocks > 0) {
      return { error: "Ese día ya tiene programación" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.programmingDay.update({
        where: { id: target.id },
        data: { title: day.title, notes: day.notes },
      });
      for (const b of day.blocks) {
        await tx.programmingBlock.create({
          data: {
            day: { connect: { id: target.id } },
            order: b.order,
            kind: b.kind,
            title: b.title,
            content: b.content,
            workout: b.workout
              ? {
                  create: {
                    name: b.workout.name,
                    description: b.workout.description,
                    scoreType: b.workout.scoreType,
                    teamId: day.teamId,
                  },
                }
              : undefined,
          },
        });
      }
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidateTeam(teamId);
  return { ok: true, message: "Copiado como borrador" };
}
