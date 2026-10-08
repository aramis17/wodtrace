import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { BarbellCalculator } from "@/components/barbell-calculator";
import { getGuestOrNull } from "@/lib/guest";
import { preferredWeightUnit } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function BarbellPage() {
  const guest = await getGuestOrNull();
  const unit: "KG" | "LB" =
    preferredWeightUnit(guest?.preference);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/tools"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-center font-display text-2xl uppercase tracking-wide text-text-primary">
          CALCULADORA DE BARRA
        </h1>
        <Link
          href="/tools/barbell/inventory"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Inventario de pesos"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      <BarbellCalculator defaultUnit={unit} />
    </div>
  );
}
