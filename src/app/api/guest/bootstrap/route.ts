import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { linkProfileToUser } from "@/lib/account";
import { getAuthUser } from "@/lib/supabase/server";
import {
  COOKIE_MAX_AGE,
  DEMO_GUEST_ID,
  DEMO_RAW_TOKEN,
  GUEST_COOKIE,
  hashToken,
  signGuestToken,
} from "@/lib/guest-token";

/** Signed-in users get their own profile; everyone else browses the shared demo profile. */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user) {
      const guestId = await linkProfileToUser(
        user,
        request.cookies.get(GUEST_COOKIE)?.value,
      );
      return NextResponse.json({ ok: true, guestId });
    }

    const profile = await prisma.guestProfile.findUnique({
      where: { id: DEMO_GUEST_ID },
    });
    if (!profile || profile.tokenHash !== hashToken(DEMO_RAW_TOKEN)) {
      throw new Error("Perfil demo no disponible. Ejecuta npm run db:seed.");
    }

    const jwt = await signGuestToken(profile.id, DEMO_RAW_TOKEN);
    const res = NextResponse.json({ ok: true, guestId: profile.id });
    res.cookies.set(GUEST_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "No se pudo crear la sesión invitada" },
      { status: 500 },
    );
  }
}
