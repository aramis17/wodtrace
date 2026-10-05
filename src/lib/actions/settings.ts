"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireGuest, resetGuestData } from "@/lib/guest";
import type { ThemePreference, WeightUnit } from "@/lib/types";

export async function updateSettings(formData: FormData) {
  const guest = await requireGuest();
  const alias = String(formData.get("alias") || "").trim() || "Atleta";
  const weightUnit = String(formData.get("weightUnit") || "KG") as WeightUnit;
  const theme = String(formData.get("theme") || "DARK") as ThemePreference;
  const keepScreenAwake = formData.get("keepScreenAwake") === "on" ||
    formData.get("keepScreenAwake") === "true";
  const athleticLevelIndex = Number(formData.get("athleticLevelIndex") ?? 0);

  await prisma.guestProfile.update({
    where: { id: guest.id },
    data: {
      alias,
      preference: {
        upsert: {
          create: {
            weightUnit: weightUnit === "LB" ? "LB" : "KG",
            theme:
              theme === "LIGHT"
                ? "LIGHT"
                : theme === "SYSTEM"
                  ? "SYSTEM"
                  : "DARK",
            keepScreenAwake,
            athleticLevelIndex: Number.isFinite(athleticLevelIndex)
              ? Math.min(3, Math.max(0, athleticLevelIndex))
              : 0,
            locale: "es",
          },
          update: {
            weightUnit: weightUnit === "LB" ? "LB" : "KG",
            theme:
              theme === "LIGHT"
                ? "LIGHT"
                : theme === "SYSTEM"
                  ? "SYSTEM"
                  : "DARK",
            keepScreenAwake,
            athleticLevelIndex: Number.isFinite(athleticLevelIndex)
              ? Math.min(3, Math.max(0, athleticLevelIndex))
              : 0,
          },
        },
      },
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetAllData() {
  const guest = await requireGuest();
  await resetGuestData(guest.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
