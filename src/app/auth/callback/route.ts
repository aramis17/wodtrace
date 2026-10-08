import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { linkProfileToUser } from "@/lib/account";
import { GUEST_COOKIE } from "@/lib/guest-token";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));

  try {
    const supabase = await createSupabaseServerClient();
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;

    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { data: { user: null }, error: new Error("missing code") };

    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=link`);
    }
    await linkProfileToUser(
      { id: data.user.id, email: data.user.email ?? null },
      request.cookies.get(GUEST_COOKIE)?.value,
    );
    return NextResponse.redirect(`${origin}${next}`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/login?error=link`);
  }
}
