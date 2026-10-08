import { prisma } from "./db";
import {
  DEMO_GUEST_ID,
  hashToken,
  newRawToken,
  verifyGuestToken,
} from "./guest-token";
import type { AuthUser } from "./supabase/server";

/** Returns the guest profile id behind a `wt_guest` cookie value, if it is valid. */
export async function guestIdFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  const verified = await verifyGuestToken(cookieValue);
  if (!verified) return null;
  const profile = await prisma.guestProfile.findUnique({
    where: { id: verified.guestId },
    select: { id: true, tokenHash: true, userId: true },
  });
  if (!profile || profile.tokenHash !== hashToken(verified.rawToken)) {
    return null;
  }
  return { id: profile.id, userId: profile.userId };
}

/**
 * Makes sure an authenticated user has a profile. A brand new account adopts the
 * browser's current private guest profile (so its history is kept), but never the
 * shared demo profile; an account that already has a profile keeps it.
 */
export async function linkProfileToUser(
  user: AuthUser,
  guestCookie: string | undefined,
) {
  const existing = await prisma.guestProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    if (user.email && existing.email !== user.email) {
      await prisma.guestProfile.update({
        where: { id: existing.id },
        data: { email: user.email },
      });
    }
    return existing.id;
  }

  const guest = await guestIdFromCookie(guestCookie);
  if (guest && !guest.userId && guest.id !== DEMO_GUEST_ID) {
    await prisma.guestProfile.update({
      where: { id: guest.id },
      data: { userId: user.id, email: user.email },
    });
    return guest.id;
  }

  const created = await prisma.guestProfile.create({
    data: {
      userId: user.id,
      email: user.email,
      tokenHash: hashToken(newRawToken()),
      alias: user.email?.split("@")[0] || "Atleta",
      preference: { create: {} },
    },
  });
  return created.id;
}
