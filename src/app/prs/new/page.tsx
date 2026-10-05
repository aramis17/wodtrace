import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { createCustomPR } from "@/lib/actions/prs";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

export default function NewPRPage() {
  async function action(formData: FormData) {
    "use server";
    const res = await createCustomPR(formData);
    if (res && "id" in res && res.id) redirect(`/prs/${res.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/prs"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl uppercase text-text-primary">
          Nuevo PR
        </h1>
      </div>
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required placeholder="Ej. Yoke carry" />
        </div>
        <div>
          <Label htmlFor="scoreType">Tipo</Label>
          <Select id="scoreType" name="scoreType" defaultValue="WEIGHT">
            {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((k) => (
              <option key={k} value={k}>
                {SCORE_TYPE_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Crear
        </Button>
      </form>
    </div>
  );
}
