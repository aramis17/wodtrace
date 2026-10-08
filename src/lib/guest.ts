import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./db";
import { GUEST_COOKIE } from "./guest-token";
import { guestIdFromCookie } from "./account";
import { getAuthUser } from "./supabase/server";

export { GUEST_COOKIE } from "./guest-token";

/**
 * Resolves the current profile: the one linked to the signed-in account, else the
 * browser's guest cookie. A guest cookie pointing at an account-linked profile only
 * counts while that account is signed in, so signing out falls back to the demo.
 */
export const ensureGuestProfile = cache(async () => {
  const user = await getAuthUser();
  if (user) {
    const linked = await prisma.guestProfile.findUnique({
      where: { userId: user.id },
      include: { preference: true },
    });
    if (linked) return linked;
  }

  const jar = await cookies();
  const guest = await guestIdFromCookie(jar.get(GUEST_COOKIE)?.value);
  if (guest && (!guest.userId || guest.userId === user?.id)) {
    const profile = await prisma.guestProfile.findUnique({
      where: { id: guest.id },
      include: { preference: true },
    });
    if (profile) return profile;
  }

  // The client-side GuestBootstrap calls /api/guest/bootstrap to mint the cookie.
  throw new Error("Sesión invitada no disponible. Recarga la página.");
});

export async function requireGuest() {
  return ensureGuestProfile();
}

/** Like requireGuest, but the profile must belong to a signed-in account. */
export async function requireAccount() {
  const profile = await ensureGuestProfile();
  if (!profile.userId) {
    throw new Error("Necesitas iniciar sesión para esta acción.");
  }
  return profile;
}

export async function getGuestOrNull() {
  try {
    return await ensureGuestProfile();
  } catch {
    return null;
  }
}

export async function resetGuestData(guestId: string) {
  await prisma.$transaction([
    prisma.workoutResult.deleteMany({ where: { guestId } }),
    prisma.personalRecordAttempt.deleteMany({ where: { guestId } }),
    prisma.favorite.deleteMany({ where: { guestId } }),
    prisma.mediaAsset.deleteMany({ where: { guestId } }),
    prisma.workout.deleteMany({ where: { guestId, isCustom: true } }),
    prisma.personalRecord.deleteMany({ where: { guestId, isCustom: true } }),
    prisma.preference.updateMany({
      where: { guestId },
      data: {
        weightUnit: "LB",
        theme: "DARK",
        keepScreenAwake: false,
        athleticLevelIndex: 0,
      },
    }),
    prisma.guestProfile.update({
      where: { id: guestId },
      data: { alias: "Atleta" },
    }),
  ]);
}
