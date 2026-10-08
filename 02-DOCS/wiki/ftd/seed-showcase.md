---
type: feature
title: Seed de demostración con cuentas
topic: ftd
status: done
timestamp: 2026-10-08T00:00:00Z
---

# Seed de demostración con cuentas

## Intent

Ver la app funcionando con datos realistas de box, coach y tracks, y entrar con usuario y contraseña guardados en un archivo local.

## Scope

- **In:** `prisma/seed-showcase.ts` (`npm run db:seed:showcase`); 7 cuentas Supabase Auth con contraseña; box CrossFit Forja y coach Marcos Coaching; 4 semanas de programación alrededor de hoy; resultados y PRs; login con contraseña solo en desarrollo o con `AUTH_PASSWORD_LOGIN=true`; credenciales en `01-TOOLS/SEED/CREDENTIALS.local.md` (git-ignorado).
- **Out:** contraseñas en el repositorio; cambiar el login por código en producción.

## Checklist

- [x] El seed crea cuentas y datos → salida `{ users: 7, days: 68, results: 45, prAttempts: 60 }`.
- [x] Las cuentas entran con la contraseña del archivo y rechazan una incorrecta → script de comprobación PASS.
- [x] Cada atleta ve solo sus tracks (Ana 4, Beto 2, Caro 1, Diego 0, Elena 1) → script de comprobación.
- [x] El archivo de credenciales no se sube → `git check-ignore` lo marca por `01-TOOLS/.gitignore`.
- [x] `tsc`, lint (0 errores) y `npm test` 75/75.

- [x] Login probado en navegador con Playwright (Carla y Ana) → `playwright-cli` interactivo y `npm run test:e2e` 4/4.

## Evidence

Ejecutado el 2026-10-08 contra la BD local y el proyecto Supabase de `.env`. Las pruebas de navegador encontraron que un `next dev` arrancado antes del cambio de esquema conserva el cliente Prisma viejo (`prisma.track` undefined); reiniciar el servidor lo resuelve.

## Next

Probar en el navegador con `npm run dev` y aprobar la Fase 1 antes de planificar la Fase 2.
