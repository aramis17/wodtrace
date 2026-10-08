"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireGuest } from "@/lib/guest";
import type { ScoreType } from "@/lib/types";

export async function createCustomWorkout(formData: FormData) {
  const guest = await requireGuest();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const scoreType = String(formData.get("scoreType") || "TIME") as ScoreType;
  const scheme = String(formData.get("scheme") || "").trim() || null;
  const rxNotes = String(formData.get("rxNotes") || "").trim() || null;
  const scaledNotes = String(formData.get("scaledNotes") || "").trim() || null;

  if (!name || !description) {
    return { error: "Nombre y descripción son obligatorios" };
  }

  const customCat = await prisma.workoutCategory.findUnique({
    where: { slug: "custom" },
  });

  const workout = await prisma.workout.create({
    data: {
      name,
      description,
      scoreType,
      scheme,
      rxNotes,
      scaledNotes,
      isCustom: true,
      isSeed: false,
      guestId: guest.id,
      categoryId: customCat?.id,
    },
  });

  revalidatePath("/wods");
  revalidatePath(`/wods/${workout.id}`);
  return {
    id: workout.id,
    message: "WOD creado",
    redirectTo: `/wods/${workout.id}`,
  };
}

export async function updateCustomWorkout(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const workout = await prisma.workout.findFirst({
    where: { id, guestId: guest.id, isCustom: true },
  });
  if (!workout) return { error: "WOD no encontrado" };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const scoreType = String(formData.get("scoreType") || workout.scoreType) as ScoreType;
  const scheme = String(formData.get("scheme") || "").trim() || null;
  const rxNotes = String(formData.get("rxNotes") || "").trim() || null;
  const scaledNotes = String(formData.get("scaledNotes") || "").trim() || null;

  if (!name || !description) {
    return { error: "Nombre y descripción son obligatorios" };
  }

  await prisma.workout.update({
    where: { id },
    data: { name, description, scoreType, scheme, rxNotes, scaledNotes },
  });

  revalidatePath("/wods");
  revalidatePath(`/wods/${id}`);
  return { id, message: "WOD actualizado", redirectTo: `/wods/${id}` };
}

export async function deleteCustomWorkout(formData: FormData) {
  const guest = await requireGuest();
  const id = String(formData.get("id") || "");
  const workout = await prisma.workout.findFirst({
    where: { id, guestId: guest.id, isCustom: true },
  });
  if (!workout) return { error: "WOD no encontrado" };

  await prisma.workout.delete({ where: { id } });
  revalidatePath("/wods");
  return { message: "WOD eliminado", redirectTo: "/wods" };
}

export async function toggleWorkoutFavorite(workoutId: string) {
  const guest = await requireGuest();
  const existing = await prisma.favorite.findUnique({
    where: {
      guestId_targetType_targetId: {
        guestId: guest.id,
        targetType: "WORKOUT",
        targetId: workoutId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: {
        guestId: guest.id,
        targetType: "WORKOUT",
        targetId: workoutId,
      },
    });
  }

  revalidatePath("/wods");
  revalidatePath(`/wods/${workoutId}`);
  revalidatePath("/");
  return { favorited: !existing };
}
