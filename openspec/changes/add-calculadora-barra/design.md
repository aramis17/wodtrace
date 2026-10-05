## Context

Actualmente `/tools/barbell` es una ruta `force-dynamic` con `BarbellCalculator` cliente muy simple: elige unidad, ingresa barra y peso objetivo, y `calculatePlates` devuelve `perSide` greedy sin limites de inventario. No hay estimacion de 1RM, ni tabla de porcentajes, ni visualizacion grafica, ni configuracion de inventario. El mockup `WebAppMockup/AppMockup/calculadora` (5 PNGs) y la propia ruta existente (ver `src/app/tools/barbell/page.tsx:1`, `src/components/barbell-calculator.tsx:1`, `src/lib/barbell.ts:1`, `src/lib/units.ts:1`) definen el baseline y las dependencias a reutilizar: `calculatePlates`, `convertWeight`/`roundWeight`, `getGuestOrNull`/`Preference.weightUnit`, Forge Dark tokens y patron mobile-first. Ver `proposal.md` Why para motivacion.

## Goals / Non-Goals

**Goals:**
- Llevar el mockup a codigo sin romper la ruta existente: transformar la calculadora simple en calculadora completa 1RM + porcentajes + discos + inventario.
- Reutilizar y extender `lib/barbell.ts` para respetar conteo de pares por denominacion y exponer `estimateOneRepMax`.
- Mantener coherencia Forge Dark (Barlow Condensed / Inter, Ember, Cards) y experiencia touch 48px vista en capturas.
- Persistir inventario/incremento por guest sin requerir migracion DB bloqueante.

**Non-Goals:**
- No redisenar navegación global ni bottom nav (mockup muestra Configuracion/WODs/PRs placeholder; se mantiene nav real de la app).
- No introducir backend nuevo de inventario por gimnasio/box multi-usuario; alcance es por guest local.
- No reemplazar `Preference` completo ni forzar migracion Prisma si localStorage basta; se evalua en Decisions.
- No implementar historico de calculos ni exportar PDFs.

## Decisions

### D1: Formula 1RM = Epley
- **Elegida:** `1RM = peso * (1 + reps/30)`, clamped reps 1..30. Alternativas Brzycki `peso*36/(37-reps)` y Lombardi `peso*reps^0.1` consideradas. Epley es simple, estable con pocas reps, coincide con mockup 225x1 => 225 y es la mas comun en apps CrossFit. Brzycki da valores mas altos con reps altas ( اختلاف 2-3%). Se documenta como supuesto en spec y se encapsula en `estimateOneRepMax(peso, reps)` testeable. Permite cambiar formula detras de interfaz sin tocar UI.

### D2: Extender `calculatePlates` con limite por pares, no reescribir
- **Elegida:** Anadir param opcional `availablePairs?: Record<weight, pares>` o `Map<number,number>` y variar el greedy: en lugar de `count = floor(remaining/plate)` ilimitado, `count = min(floor(remaining/plate), paresDisponibles*2?/1?)`. Mantener firma compatible: si no se pasa, comportamiento ilimitado (fallback). Alternativa crear `calculatePlatesWithInventory` duplicaria logica. Se preserva `PLATES_KG`/`PLATES_LB` y `DEFAULT_BAR_*`, y se exporta `PLATE_INVENTORY_DEFAULTS` por unidad para inicializacion.
- **Por que:** Un solo punto de verdad para discos; tests existentes (`barbell.test.ts`) siguen pasando; cambio retrocompatible.

### D3: Generacion de tabla de porcentajes cliente-side memoizada
- **Elegida:** Hook `useMemo(() => buildPercentages(irm, increment), [irm, increment])` genera array `[{pct:110, weight:roundWeight(irm*1.10)}, ...]` rango `30..110` o `70..110` segun mockup (fila truncada sugiere continuo). Alternativa server component perderia reactividad de inputs. Tradeoff correcto: puro calculo, sin IO.
- Rango exacto: mockup muestra desde 110% bajando a 85%,75%,70% (cortado). Se decide `30%..110%` con step = incremento; UI scrollable con maxHeight y sticky header PORCENTAJES para fidelidad y utilidad.

### D4: Persistencia via localStorage + Preference JSON (estrategia hibrida)
- **Elegida:** Cliente guarda `barbell:inventory:v1` en `localStorage` (clave por guestId) y, si `Preference` existe, opcional sync a campo JSON `Preference.settings` o columnas `barWeight`/`percentageIncrement` si se migra luego. Lectura prioriza `Preference` server-hidratado (`getGuestOrNull`) y fallback a localStorage en mount.
- **Alternativas:** Solo DB requiere migracion Prisma y serializacion map; solo localStorage pierde cross-device. Hibrido evita migracion bloqueante y permite evolucionar a DB sin cambiar UI.
- Persistidos: `barWeight`, `increment` (`1|2|5|10|15`), `platePairs` (dict peso->pares).

### D5: UI en cliente con Server shell delgado
- **Elegida:** `page.tsx` sigue siendo server (`force-dynamic`) solo para obtener `guest.weightUnit` y pasar `defaultUnit`/`defaultInventory` a `BarbellCalculator` cliente. Todo lo demas (inputs, 1RM, tabla, modales, inventory) es cliente. Alternativa server actions aumentaria latencia.
- Componentes nuevos: `PlateVisualization` (barra SVG + rects por disco, color por peso fijo), `PercentageTable` + `IncrementSelectorModal`, `InventorySheet` o pagina `/tools/barbell/inventory` reutilizando `Input`/`Card`/`Label`. `BarbellCalculator` se refactoriza en subcomponentes pero mantiene archivo como orquestador.

### D6: Navegacion: pagina dedicada para Inventario
- **Elegida:** Nueva ruta `src/app/tools/barbell/inventory/page.tsx` (server) + cliente `InventoryEditor` accesible por engranaje top-right y por back. Mockup `calculadora_settings_inventario.PNG` es fullscreen sheet; en app se modela como pagina para deep-link y back nativo, con opcion de presentarlo como modal bottom-sheet en desktop. Alternativa solo modal dificultaria share y A11y.

## Risks / Trade-offs

- **[Riesgo] Divergencia de redondeo teorico vs alcanzable** -> El texto "Peso mas cercano posible: X" puede confundir si `remainder` grande. Mitigacion: mostrar siempre ambos: peso teorico en header y alcanzado abajo, con `remainder` en kg/lb小的 y nota.
- **[Riesgo] Inventario greedy no optimo en casos con denominaciones no canonicas** -> Greedy descendente es optimo para set canonico US/EU pero puede fallar con sets custom. Mitigacion: documentar set canonico; algoritmo sigue greedy por simplicidad y tests; si se requiere Optimo, implementar DP en futuro detras de misma funcion.
- **[Riesgo] Formula Epley vs expectativa usuario** -> Algunos usuarios esperan Brzycki. Mitigacion: encapsular formula y dejar puerta a selector de formula en inventario futuro sin cambiar spec.
- **[Riesgo] Persistencia localStorage sin sync multi-dispositivo** -> Guest en otro dispositivo ve defaults. Mitigacion: aceptar como Non-Goal v1; futuro sync via Preference DB sin cambiar contrato.
- **[Riesgo] Performance de render de discos con muchos tipos** -> SVG con pocos rects (<20) despreciable; memoizar visualizacion por peso.

## Migration Plan

1. Extender `src/lib/barbell.ts` con `estimateOneRepMax` y param `availablePairs` en `calculatePlates` (retrocompatible).
2. Crear `Inventory` persistence helper `src/lib/barbell-inventory.ts` (defaults, load/save localStorage + Preference hydration).
3. Refactorizar `BarbellCalculator` e introducir `PlateVisualization`, `PercentageTable`, `IncrementSelectorModal`; anadir `inventory` page.
4. Deploy sin migracion DB; no hay cambios Prisma requeridos v1. Si se decide persistir en `Preference`, migracion `prisma migrate dev` anadiendo `barbellSettings Json?` y backfill defaults.
5. Rollback: revertir commit restaura calculadora simple; no hay datos criticos que migrar hacia atras (localStorage versionado `v1`).

## Open Questions

- Rango inferior exacto de porcentajes: mockup corta en ~70%, pero rango util podria ser 30%. Confirmar con producto si 30..110 es deseado; no bloquea implementacion (const `MIN_PCT`).
- Color por peso de disco: mockup usa azul para 45, negro para 5; no hay paleta canonica en Design.md. Definir mapa `PLATE_COLORS` cercano a estandar gym.

