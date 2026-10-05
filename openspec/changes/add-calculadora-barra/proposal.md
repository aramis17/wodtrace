## Why

La Calculadora de Barra actual (`/tools/barbell`) solo calcula discos por lado para un peso objetivo. Los mockups en `WebAppMockup/AppMockup/calculadora` (5 PNGs) muestran un flujo mucho mas rico y esperado por atletas: estimar 1RM a partir de peso + reps, navegar tabla de porcentajes con incremento configurable y visualizar el montaje de discos mas cercano segun el inventario real del box. Completar este flujo cierra la brecha entre el mockup y el producto, aporta utilidad diaria en entrenamiento y mantiene coherencia con el sistema Forge Dark.

## What Changes

- Evolucionar `/tools/barbell` de calculadora simple a **Calculadora de Barra completa**:
  - Inputs superiores `PESO (LB/KG)` y `REPS` para estimar **1RM estimado** (formula Epley por defecto).
  - Tarjeta central destacada para 1RM estimado con tipografia display.
  - Seccion **PORCENTAJES** con tabla scrollable de `30%..110%` (rango del mockup) calculada sobre 1RM. Cada fila muestra `%` y `peso` redondeado y chevron `>`. Hint superior `-- TOCA UNA FILA PARA VER LOS DISCOS --`.
  - Selector de incremento de porcentaje (`1% / 2% / 5% / 10% / 15%`) accionado por pill `5%` en header de la tabla. Modal bottom-sheet con opciones y estados Cancelar/Listo.
  - Interaccion de fila: abre **modal de visualizacion de barra** con porcentaje/peso de la fila, render isomorfico de barra + discos apilados, y texto `Peso mas cercano posible: X lb/kg` cuando el peso teorico no es cargable con el inventario actual. Cierre con `X`.
  - Icono **engranaje** en header (top-right) navega a **Inventario de Pesos** (`/tools/barbell/inventory` o modal/pagina dedicada): input `PESO DE LA BARRA` (default 45 lb / 20 kg segun unidad) y lista **PARES DE DISCOS DISPONIBLES** con filas por denominacion (`55,45,35,25,15,10,5,2.5,1.25,1,...`) y controles `- / 0 pares / +` por fila.
  - Respeto de unidad del usuario (`KG`/`LB`) via `guest.preference.weightUnit` y conversion consistente. Persistencia de inventario y de `incremento`/`barra` por guest (Preference JSON o localStorage con fallback).
- Mantener compatibilidad con logica existente `calculatePlates` en `src/lib/barbell.ts` extendiendola para soportar inventario por pares (limite por tipo).
- Ajustar navegacion y estilos para coincidir con Forge Dark, Barlow Condensed, acentos Ember y comportamiento mobile-first del mockup.

## Capabilities

### New Capabilities
- `tools/calculadora-barra`: Calculadora de barra con estimacion 1RM, tabla de porcentajes con incremento configurable, visualizacion de discos por porcentaje y gestion de inventario de barra/discos por guest.

### Modified Capabilities
- (ninguna) - no modifica REQUIREMENTS de capacidades existentes; la ruta `/tools/barbell` ya existe como shell y se amplia dentro de la nueva capacidad.

## Impact

- **Codigo**: `src/app/tools/barbell/page.tsx`, `src/components/barbell-calculator.tsx` (refactor mayor), `src/lib/barbell.ts` (extender `calculatePlates` para respetar conteo de pares y exponer `estimateOneRepMax`), posiblemente `src/lib/units.ts`, `src/lib/guest.ts`/`Preference` o `localStorage` para persistencia, nuevo componente `PlateVisualization`, nuevo `InventoryPage/Modal`.
- **APIs/DB**: Opcional campo `barbellInventory`/`barWeight`/`percentageIncrement` en `Preference` (o almacenamiento cliente). Sin breaking changes de schema si se usa JSON local.
- **UX**: Reemplaza la UI simple actual por el flujo de 5 pantallas del mockup; mantiene ruta existente por lo que no hay breaking route, pero hay breaking visual (intencional).
- **Dependencias**: Ninguna nueva libreria prevista; reusar `lucide-react`, `next/font` (Barlow Condensed/Inter), y utilidades de `units`.
