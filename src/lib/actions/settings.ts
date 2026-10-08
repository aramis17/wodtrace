"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireGuest, resetGuestData } from "@/lib/guest";
import type { ThemePreference } from "@/lib/types";
import { preferredWeightUnit } from "@/lib/units";

export async function updateSettings(formData: FormData) {
  const guest = await requireGuest();
  const alias = String(formData.get("alias") || "").trim() || "Atleta";
  const weightUnit = preferredWeightUnit({
    weightUnit: String(formData.get("weightUnit") || ""),
  });
  const theme = String(formData.get("theme") || "DARK") as ThemePreference;
  const keepScreenAwake = formData.get("keepScreenAwake") === "on" ||
    formData.get("keepScreenAwake") === "true";
  const athleticLevelIndex = Number(formData.get("athleticLevelIndex") ?? 0);
  const showOnLeaderboard = formData.get("showOnLeaderboard") === "true";

  await prisma.guestProfile.update({
    where: { id: guest.id },
    data: {
      alias,
      preference: {
        upsert: {
          create: {
            weightUnit,
            theme:
              theme === "LIGHT"
                ? "LIGHT"
                : theme === "SYSTEM"
                  ? "SYSTEM"
                  : "DARK",
            keepScreenAwake,
            showOnLeaderboard,
            athleticLevelIndex: Number.isFinite(athleticLevelIndex)
              ? Math.min(3, Math.max(0, athleticLevelIndex))
              : 0,
            locale: "es",
          },
          update: {
            weightUnit,
            theme:
              theme === "LIGHT"
                ? "LIGHT"
                : theme === "SYSTEM"
                  ? "SYSTEM"
                  : "DARK",
            keepScreenAwake,
            showOnLeaderboard,
            athleticLevelIndex: Number.isFinite(athleticLevelIndex)
              ? Math.min(3, Math.max(0, athleticLevelIndex))
              : 0,
          },
        },
      },
    },
  });

  revalidatePath("/", "layout");
  return { message: "Configuración guardada" };
}

export async function resetAllData() {
  const guest = await requireGuest();
  await resetGuestData(guest.id);
  revalidatePath("/", "layout");
  return { message: "Datos restablecidos", redirectTo: "/" };
}
