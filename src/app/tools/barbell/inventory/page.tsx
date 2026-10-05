import Link from "next/link";
import { X } from "lucide-react";
import { InventoryEditor } from "@/components/inventory-editor";
import { getGuestOrNull } from "@/lib/guest";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const guest = await getGuestOrNull();
  const unit: "KG" | "LB" = guest?.preference?.weightUnit === "LB" ? "LB" : "KG";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/tools/barbell"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary hover:bg-card"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-center font-display text-xl uppercase tracking-wide text-text-primary">
          INVENTARIO DE PESOS
        </h1>
        <span className="min-h-12 min-w-12" aria-hidden="true" />
      </div>
      <InventoryEditor defaultUnit={unit} />
    </div>
  );
}
