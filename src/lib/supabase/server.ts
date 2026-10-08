import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Supabase client bound to the request cookies. Cookie writes are ignored in Server Components. */
export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase Auth no está configurado");
  }
  const jar = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            jar.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export interface AuthUser {
  id: string;
  email: string | null;
}

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  if (!isAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;
    return {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
    };
  } catch {
    return null;
  }
});
