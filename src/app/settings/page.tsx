import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calculator,
  ExternalLink,
  HelpCircle,
  Share2,
  Star,
  Timer,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { getGuestOrNull } from "@/lib/guest";
import { GuestLoading } from "@/lib/guest-page";
import { resetAllData, updateSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const guest = await getGuestOrNull();
  if (!guest) return <GuestLoading />;
  const pref = guest.preference;
  const levels = await prisma.athleticLevel.findMany({
    orderBy: { sortOrder: "asc" },
  });

  async function save(formData: FormData) {
    "use server";
    await updateSettings(formData);
    redirect("/settings");
  }

  async function reset() {
    "use server";
    await resetAllData();
    redirect("/");
  }

  const helpUrl = pref?.helpUrl || "https://opencode.ai";
  const shareUrl = pref?.shareUrl || "";
  const rateUrl = pref?.rateUrl || "";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl uppercase text-text-primary">
          Configuración
        </h1>
        <p className="text-sm text-text-muted">Perfil invitado · solo este navegador</p>
      </header>

      <form action={save} className="space-y-4">
        <Card className="space-y-4">
          <div>
            <Label htmlFor="alias">Alias de atleta</Label>
            <Input id="alias" name="alias" defaultValue={guest.alias} />
          </div>
          <div>
            <Label htmlFor="weightUnit">Unidad de peso</Label>
            <Select
              id="weightUnit"
              name="weightUnit"
              defaultValue={pref?.weightUnit ?? "KG"}
            >
              <option value="KG">Kilogramos (kg)</option>
              <option value="LB">Libras (lb)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Select id="theme" name="theme" defaultValue={pref?.theme ?? "DARK"}>
              <option value="DARK">Oscuro</option>
              <option value="LIGHT">Claro</option>
              <option value="SYSTEM">Sistema</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="athleticLevelIndex">Nivel atlético (visual)</Label>
            <Select
              id="athleticLevelIndex"
              name="athleticLevelIndex"
              defaultValue={String(pref?.athleticLevelIndex ?? 0)}
            >
              {levels.map((l, i) => (
                <option key={l.id} value={i}>
                  {l.name}
                </option>
              ))}
              {levels.length === 0 ? (
                <option value="0">Iniciado</option>
              ) : null}
            </Select>
          </div>
          <label className="flex min-h-12 items-center gap-3 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="keepScreenAwake"
              value="true"
              defaultChecked={pref?.keepScreenAwake ?? false}
              className="h-5 w-5 accent-ember"
            />
            Mantener pantalla encendida (preferencia)
          </label>
          <p className="text-xs text-text-muted">Idioma: Español</p>
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </Card>
      </form>

      <Card className="space-y-1 p-2">
        <SettingsLink href="/tools/barbell" icon={Calculator} label="Calculadora de barra" />
        <SettingsLink href="/timers" icon={Timer} label="Temporizadores" />
        {helpUrl ? (
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-text-secondary hover:bg-surface"
          >
            <HelpCircle className="h-5 w-5" />
            Ayuda
            <ExternalLink className="ml-auto h-4 w-4 text-text-muted" />
          </a>
        ) : null}
        {shareUrl ? (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-text-secondary hover:bg-surface"
          >
            <Share2 className="h-5 w-5" />
            Compartir
          </a>
        ) : null}
        {rateUrl ? (
          <a
            href={rateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-text-secondary hover:bg-surface"
          >
            <Star className="h-5 w-5" />
            Calificar
          </a>
        ) : null}
      </Card>

      <Card>
        <p className="mb-3 text-sm text-text-muted">
          Elimina todos tus resultados, favoritos y WODs/PRs personalizados de
          este perfil invitado. No se puede deshacer.
        </p>
        <form action={reset}>
          <Button type="submit" variant="danger" className="w-full">
            Restablecer datos
          </Button>
        </form>
      </Card>
    </div>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-text-secondary hover:bg-surface"
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
