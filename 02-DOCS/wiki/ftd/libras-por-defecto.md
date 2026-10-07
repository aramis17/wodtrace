---
type: feature
title: Libras por defecto
topic: ftd
status: in-progress
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
- [ ] Schema `@default(LB)` aplicado a la BD. El código ya está cambiado; falta `prisma db push` porque la BD local está apagada.
- [ ] El perfil demo y el reset usan LB. `seed-demo.ts` y el reset ya usan LB; falta actualizar la fila del demo que ya existe en la BD.
- [x] Constitución, principio 11, actualizada.
- [x] Lint, tsc, tests y build en verde.

## Evidence

- `npx vitest run` → 67 passed (incluye 2 tests nuevos de `preferredWeightUnit`).
- `tsc --noEmit` sin errores; `npm run lint` 0 errores (1 warning previo ajeno).
- `npm run build` → Compiled successfully.
- Búsqueda de fallbacks `?? "KG"` / `|| "KG"` en `src/` → 0 resultados.
- `prisma db push` → P1001, BD local no accesible.

## Next

Con la BD local encendida: `npx prisma db push` y `UPDATE "Preference" SET "weightUnit"='LB' WHERE "guestId"='wodtrace-demo';` (o `npm run db:seed` si el demo aún no existe).
