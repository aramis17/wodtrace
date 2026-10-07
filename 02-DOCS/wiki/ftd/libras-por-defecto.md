---
type: feature
title: Libras por defecto
topic: ftd
status: done
timestamp: 2026-10-07T00:00:00Z
---

# Libras por defecto

## Intent

La app debe mostrar y pedir el peso en libras por defecto. Internamente se sigue guardando en kg
(`weightKg`), y cada usuario puede cambiar a kg en Configuración.

## Scope

- **In:**
  - Default de `Preference.weightUnit` → `LB`.
  - Un único helper para elegir la unidad, en lugar de repetir el fallback a `KG` en cada página.
  - Defaults de los componentes.
  - El perfil demo.
  - El restablecimiento de datos.
  - Constitución, principio 11.
- **Out:**
  - Cambiar la unidad de almacenamiento.
  - Convertir datos existentes.
  - Cambiar la preferencia de usuarios que ya eligieron kg.

## Checklist

- [x] Helper `preferredWeightUnit` + `DEFAULT_WEIGHT_UNIT = "LB"` en `src/lib/units.ts`, con test.
- [x] Páginas y acciones usan el helper (no queda ningún fallback a `"KG"`).
- [x] Schema `@default(LB)` aplicado a la BD.
- [x] El perfil demo y el reset usan LB.
- [x] Constitución, principio 11, actualizada.
- [x] Lint, tsc, tests y build en verde.

## Evidence

- `npx vitest run` → 67 passed (incluye 2 tests nuevos de `preferredWeightUnit`).
- `tsc --noEmit` sin errores; `npm run lint` 0 errores (1 warning previo ajeno).
- `npm run build` → Compiled successfully.
- Búsqueda de fallbacks `?? "KG"` / `|| "KG"` en `src/` → 0 resultados.
- `prisma db push` (BD local) → "Your database is now in sync".
- Columna `Preference.weightUnit` default → `'LB'::"WeightUnit"`; perfil demo → `LB` (1 fila actualizada).

## Next

Nada pendiente.
