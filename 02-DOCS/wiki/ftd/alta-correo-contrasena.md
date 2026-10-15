---
type: feature
title: Alta y acceso solo con correo y contraseña
topic: ftd
status: done
branch: master
timestamp: 2026-10-15T00:00:00Z
---

# Alta y acceso solo con correo y contraseña

## Intent

Que un atleta (y cualquier cuenta) se dé de alta y entre solo con correo y contraseña. Sin código ni enlace mágico.

## Scope

- **In:**
  - `/registro`: correo + contraseña + repetir contraseña. La cuenta se crea en el servidor ya confirmada (API admin de Supabase) y entra al momento.
  - `/login`: solo correo + contraseña, siempre visible (se quita la puerta `AUTH_PASSWORD_LOGIN`).
  - `/login/recuperar` → email de Supabase → `/auth/callback` → `/login/nueva-contrasena`.
  - Se elimina el login por código/enlace (`sendLoginCode`, `verifyLoginCode`, `AUTH_EMAIL_CODE`).
  - Validación pura en `src/lib/auth-rules.ts` con tests.
- **Out:** confirmar el correo; login social; cambiar la contraseña desde Configuración.

## Checklist

- [x] `auth-rules.ts` con tests (correo, contraseña mínima 8, repetición) → `npx vitest run src/lib/auth-rules.test.ts`
- [x] Alta crea cuenta, perfil y sesión → e2e "Crear cuenta"
- [x] Correo ya registrado da error claro → e2e
- [x] Login con contraseña sigue funcionando → e2e existentes
- [x] Recuperar contraseña responde con mensaje genérico (no revela si existe la cuenta) → e2e
- [x] Nueva contraseña exige sesión de recuperación → e2e
- [x] No queda rastro del login por código → `grep`
- [x] `tsc`, lint, `npm test`, `npm run test:e2e`

## Evidence

2026-10-15:
- `npx vitest run src/lib/auth-rules.test.ts` → 8/8; `npm test` → 83/83.
- `npm run test:e2e` → 10/10 (4 de login + 6 de alta). La cuenta temporal se borra al final: 0 perfiles y 0 usuarios `e2e-*` restantes.
- `grep` sin rastros de `sendLoginCode`, `verifyLoginCode`, `AUTH_EMAIL_CODE` ni `AUTH_PASSWORD_LOGIN`.
- `tsc` sin errores, lint 0 errores, `npm run build` OK con `/login`, `/registro`, `/login/recuperar`, `/login/nueva-contrasena`.
- No probado de punta a punta: el email real de recuperación (no se envía desde los tests para no generar rebotes a `@wodtrace.test`).

## Next

En Supabase (Authentication): desactivar «Allow new users to sign up» para que nadie cree cuentas saltándose `/registro` (la API admin sigue funcionando), y añadir `http://localhost:3000/auth/callback` (y el dominio de producción) a Redirect URLs para el enlace de recuperación.
