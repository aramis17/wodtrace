"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireGuest } from "@/lib/guest";
import { parseTimeToSeconds } from "@/lib/scoring";
import { parseWeightInput, type WeightUnit } from "@/lib/units";
import { parseDateInput } from "@/lib/utils";
import { uploadResultPhoto } from "@/lib/storage";
import type { Scaling } from "@/lib/types";

export async function logWorkoutResult(formData: FormData) {
  const guest = await requireGuest();
  const workoutId = String(formData.get("workoutId") || "");
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      OR: [{ isSeed: true }, { guestId: guest.id }],
    },
  });
  if (!workout) return { error: "WOD no encontrado" };

  const performedAtRaw = String(formData.get("performedAt") || "");
  const performedAt = performedAtRaw
    ? parseDateInput(performedAtRaw)
    : new Date();
  const scaling = (String(formData.get("scaling") || "RX") as Scaling) || "RX";
  const notes = String(formData.get("notes") || "").trim() || null;
  const unit = (guest.preference?.weightUnit || "KG") as WeightUnit;

  let timeSeconds: number | null = null;
  let reps: number | null = null;
  let weightKg: number | null = null;
  let rounds: number | null = null;
  let extraReps: number | null = null;
  let customValue: string | null = null;

  switch (workout.scoreType) {
    case "TIME": {
      timeSeconds = parseTimeToSeconds(String(formData.get("time") || ""));
      if (timeSeconds == null) return { error: "Tiempo inválido (mm:ss)" };
      break;
    }
    case "REPS_TIME": {
      reps = Number(formData.get("reps"));
      timeSeconds = parseTimeToSeconds(String(formData.get("time") || ""));
      if (!Number.isFinite(reps) || reps < 0)
        return { error: "Reps inválidas" };
      if (timeSeconds == null) return { error: "Tiempo inválido" };
      break;
    }
    case "WEIGHT": {
      weightKg = parseWeightInput(String(formData.get("weight") || ""), unit);
      if (weightKg == null) return { error: "Peso inválido" };
      break;
    }
    case "AMRAP": {
      rounds = Number(formData.get("rounds"));
      extraReps = Number(formData.get("extraReps") || 0);
      if (!Number.isFinite(rounds) || rounds < 0)
        return { error: "Rondas inválidas" };
      if (!Number.isFinite(extraReps) || extraReps < 0) extraReps = 0;
      break;
    }
    case "CUSTOM": {
      customValue = String(formData.get("customValue") || "").trim();
      if (!customValue) return { error: "Valor requerido" };
      break;
    }
  }

  let mediaId: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const uploaded = await uploadResultPhoto(guest.id, photo);
      const media = await prisma.mediaAsset.create({
        data: {
          guestId: guest.id,
          storagePath: uploaded.storagePath,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
        },
      });
      mediaId = media.id;
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Error al subir la foto",
      };
    }
  }

  const result = await prisma.workoutResult.create({
    data: {
      guestId: guest.id,
      workoutId,
      performedAt,
      scaling,
      timeSeconds,
      reps,
      weightKg,
      rounds,
      extraReps,
      customValue,
      notes,
      mediaId,
    },
  });

  revalidatePath("/");
  revalidatePath("/activity");
  revalidatePath(`/wods/${workoutId}`);
  return { id: result.id };
}

export async function updateWorkoutResult(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const existing = await prisma.workoutResult.findFirst({
    where: { id, guestId: guest.id },
    include: { workout: true },
  });
  if (!existing) return { error: "Resultado no encontrado" };

  const performedAtRaw = String(formData.get("performedAt") || "");
  const performedAt = performedAtRaw
    ? parseDateInput(performedAtRaw)
    : existing.performedAt;
  const scaling = (String(formData.get("scaling") || existing.scaling) as Scaling);
  const notes = String(formData.get("notes") || "").trim() || null;
  const unit = (guest.preference?.weightUnit || "KG") as WeightUnit;

  const data: Record<string, unknown> = {
    performedAt,
    scaling,
    notes,
  };

  switch (existing.workout.scoreType) {
    case "TIME": {
      const t = parseTimeToSeconds(String(formData.get("time") || ""));
      if (t == null) return { error: "Tiempo inválido" };
      data.timeSeconds = t;
      break;
    }
    case "REPS_TIME": {
      const reps = Number(formData.get("reps"));
      const t = parseTimeToSeconds(String(formData.get("time") || ""));
      if (!Number.isFinite(reps)) return { error: "Reps inválidas" };
      if (t == null) return { error: "Tiempo inválido" };
      data.reps = reps;
      data.timeSeconds = t;
      break;
    }
    case "WEIGHT": {
      const w = parseWeightInput(String(formData.get("weight") || ""), unit);
      if (w == null) return { error: "Peso inválido" };
      data.weightKg = w;
      break;
    }
    case "AMRAP": {
      data.rounds = Number(formData.get("rounds"));
      data.extraReps = Number(formData.get("extraReps") || 0);
      break;
    }
    case "CUSTOM": {
      data.customValue = String(formData.get("customValue") || "").trim();
      break;
    }
  }

  await prisma.workoutResult.update({ where: { id }, data });

  revalidatePath("/");
  revalidatePath("/activity");
  revalidatePath(`/wods/${existing.workoutId}`);
  return { id };
}

export async function deleteWorkoutResult(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const existing = await prisma.workoutResult.findFirst({
    where: { id, guestId: guest.id },
  });
  if (!existing) return { error: "Resultado no encontrado" };

  await prisma.workoutResult.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/activity");
  revalidatePath(`/wods/${existing.workoutId}`);
  return { ok: true };
}
