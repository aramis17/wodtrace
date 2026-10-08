import Link from "next/link";
import { EmptyState } from "./ui/empty-state";
import { Button } from "./ui/button";

export function AccountRequired({
  next,
  description,
}: {
  next: string;
  description: string;
}) {
  return (
    <EmptyState
      title="Inicia sesión"
      description={description}
      action={
        <Link href={`/login?next=${encodeURIComponent(next)}`}>
          <Button>Entrar con tu correo</Button>
        </Link>
      }
    />
  );
}
