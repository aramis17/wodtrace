"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { linkProfileToUser } from "@/lib/account";
import { GUEST_COOKIE } from "@/lib/guest-token";
import { safeNextPath } from "@/lib/utils";
import {
  createSupabaseServerClient,
  isAuthConfigured,
} from "@/lib/supabase/server";

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function sendLoginCode(
  _prev: { error?: string; sentTo?: string } | null,
  formData: FormData,
) {
  if (!isAuthConfigured()) return { error: "El inicio de sesión no está configurado." };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo inválido" };
  }
  const next = safeNextPath(formData.get("next"));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: "No se pudo enviar el correo. Inténtalo de nuevo." };
  return { sentTo: email };
}

/** Code entry keeps the session inside an installed PWA, where magic links open the browser instead. */
export async function verifyLoginCode(
  _prev: { error?: string; sentTo?: string } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("token") || "").replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) return { error: "Código inválido", sentTo: email };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error || !data.user) {
    return { error: "Código incorrecto o caducado", sentTo: email };
  }
  const jar = await cookies();
  await linkProfileToUser(
    { id: data.user.id, email: data.user.email ?? email },
    jar.get(GUEST_COOKIE)?.value,
  );
  revalidatePath("/", "layout");
  redirect(safeNextPath(formData.get("next")));
}

export async function signOut() {
  if (isAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  // The guest cookie may point at the account's profile; drop it so bootstrap restores the demo.
  (await cookies()).delete(GUEST_COOKIE);
  revalidatePath("/", "layout");
  return { message: "Sesión cerrada", redirectTo: "/" };
}
