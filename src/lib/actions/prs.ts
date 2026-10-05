"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireGuest } from "@/lib/guest";
import { parseTimeToSeconds } from "@/lib/scoring";
import { parseWeightInput, type WeightUnit } from "@/lib/units";
import { parseDateInput } from "@/lib/utils";
import type { ScoreType } from "@/lib/types";

export async function createCustomPR(formData: FormData) {
  const guest = await requireGuest();
  const name = String(formData.get("name") || "").trim();
  const scoreType = String(formData.get("scoreType") || "WEIGHT") as ScoreType;
  if (!name) return { error: "Nombre obligatorio" };

  const pr = await prisma.personalRecord.create({
    data: {
      name,
      scoreType,
      isCustom: true,
      isSeed: false,
      guestId: guest.id,
    },
  });

  revalidatePath("/prs");
  return { id: pr.id };
}

export async function renamePR(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Nombre obligatorio" };

  const pr = await prisma.personalRecord.findFirst({
    where: {
      id,
      OR: [
        { guestId: guest.id, isCustom: true },
        { isSeed: true },
      ],
    },
  });
  if (!pr) return { error: "PR no encontrado" };

  // Seed PRs: only custom rename via a guest-owned copy is allowed for name;
  // allow rename only on custom
  if (!pr.isCustom || pr.guestId !== guest.id) {
    return { error: "Solo puedes renombrar PRs personalizados" };
  }

  await prisma.personalRecord.update({ where: { id }, data: { name } });
  revalidatePath("/prs");
  revalidatePath(`/prs/${id}`);
  return { id };
}

export async function togglePRFavorite(prId: string) {
  const guest = await requireGuest();
  const existing = await prisma.favorite.findUnique({
    where: {
      guestId_targetType_targetId: {
        guestId: guest.id,
        targetType: "PERSONAL_RECORD",
        targetId: prId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: {
        guestId: guest.id,
        targetType: "PERSONAL_RECORD",
        targetId: prId,
      },
    });
  }

  revalidatePath("/prs");
  revalidatePath(`/prs/${prId}`);
  return { favorited: !existing };
}

export async function logPRAttempt(formData: FormData) {
  const guest = await requireGuest();
  const personalRecordId = String(formData.get("personalRecordId") || "");
  const pr = await prisma.personalRecord.findFirst({
    where: {
      id: personalRecordId,
      OR: [{ isSeed: true }, { guestId: guest.id }],
    },
  });
  if (!pr) return { error: "PR no encontrado" };

  const performedAtRaw = String(formData.get("performedAt") || "");
  const performedAt = performedAtRaw
    ? parseDateInput(performedAtRaw)
    : new Date();
  const notes = String(formData.get("notes") || "").trim() || null;
  const unit = (guest.preference?.weightUnit || "KG") as WeightUnit;

  let timeSeconds: number | null = null;
  let reps: number | null = null;
  let weightKg: number | null = null;

  switch (pr.scoreType) {
    case "TIME":
      timeSeconds = parseTimeToSeconds(String(formData.get("time") || ""));
      if (timeSeconds == null) return { error: "Tiempo inválido" };
      break;
    case "WEIGHT":
      weightKg = parseWeightInput(String(formData.get("weight") || ""), unit);
      if (weightKg == null) return { error: "Peso inválido" };
      break;
    case "AMRAP":
    case "REPS_TIME":
    case "CUSTOM":
      reps = Number(formData.get("reps"));
      if (!Number.isFinite(reps) || reps < 0)
        return { error: "Reps inválidas" };
      break;
  }

  const attempt = await prisma.personalRecordAttempt.create({
    data: {
      guestId: guest.id,
      personalRecordId,
      performedAt,
      timeSeconds,
      reps,
      weightKg,
      notes,
    },
  });

  revalidatePath("/prs");
  revalidatePath(`/prs/${personalRecordId}`);
  revalidatePath("/");
  revalidatePath("/activity");
  return { id: attempt.id };
}

export async function deletePRAttempt(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const existing = await prisma.personalRecordAttempt.findFirst({
    where: { id, guestId: guest.id },
  });
  if (!existing) return { error: "Intento no encontrado" };

  await prisma.personalRecordAttempt.delete({ where: { id } });
  revalidatePath("/prs");
  revalidatePath(`/prs/${existing.personalRecordId}`);
  revalidatePath("/activity");
  return { ok: true };
}
