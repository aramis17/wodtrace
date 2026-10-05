import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

export const GUEST_COOKIE = "wt_guest";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const DEMO_GUEST_ID = "wodtrace-demo";
export const DEMO_RAW_TOKEN = "wodtrace-public-demo-session-v1";

export function getGuestSecret() {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return new TextEncoder().encode(
      "wodtrace-dev-secret-change-me-32chars!!",
    );
  }
  return new TextEncoder().encode(secret);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newRawToken(): string {
  return randomBytes(32).toString("hex");
}

export async function signGuestToken(guestId: string, rawToken: string) {
  return new SignJWT({ gid: guestId, t: rawToken })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(getGuestSecret());
}

export async function verifyGuestToken(
  jwt: string,
): Promise<{ guestId: string; rawToken: string } | null> {
  try {
    const { payload } = await jwtVerify(jwt, getGuestSecret());
    const guestId = payload.gid;
    const rawToken = payload.t;
    if (typeof guestId !== "string" || typeof rawToken !== "string") {
      return null;
    }
    return { guestId, rawToken };
  } catch {
    return null;
  }
}
