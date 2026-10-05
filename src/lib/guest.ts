import { cookies } from "next/headers";
import { prisma } from "./db";
import {
  DEMO_GUEST_ID,
  GUEST_COOKIE,
  hashToken,
  verifyGuestToken,
} from "./guest-token";

export { GUEST_COOKIE } from "./guest-token";

export async function ensureGuestProfile() {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;

  if (existing) {
    const verified = await verifyGuestToken(existing);
    if (verified) {
      const profile = await prisma.guestProfile.findUnique({
        where: { id: verified.guestId },
        include: { preference: true },
      });
      if (
        profile?.id === DEMO_GUEST_ID &&
        profile.tokenHash === hashToken(verified.rawToken)
      ) {
        return profile;
      }
    }
  }

  // Cookie is minted in proxy on first visit; if missing during RSC,
  // create a provisional profile only if DB is up — proxy should have set cookie.
  throw new Error(
    "Sesión invitada no disponible. Recarga la página.",
  );
}

export async function requireGuest() {
  return ensureGuestProfile();
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
        weightUnit: "KG",
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
