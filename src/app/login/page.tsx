import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoginForm } from "@/components/login-form";
import { getAuthUser, isAuthConfigured } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  if (await getAuthUser()) redirect(next);

  if (!isAuthConfigured()) {
    return (
      <EmptyState
        title="Inicio de sesión no disponible"
        description="Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY."
      />
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <header>
        <h1 className="font-display text-3xl uppercase text-text-primary">
          Entrar
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Con tu cuenta tus registros son solo tuyos y puedes unirte a un box
          o coach, o programar a tus atletas.
        </p>
      </header>
      {error === "link" ? (
        <p role="alert" className="text-sm text-danger">
          El enlace no es válido o caducó. Pide un código nuevo.
        </p>
      ) : null}
      <Card>
        <LoginForm next={next} codeEntry={process.env.AUTH_EMAIL_CODE === "true"} />
      </Card>
    </div>
  );
}
