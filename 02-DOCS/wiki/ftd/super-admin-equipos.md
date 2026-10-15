---
type: feature
title: Solo el super administrador da de alta boxes y coaches
topic: ftd
status: done
branch: master
timestamp: 2026-10-15T00:00:00Z
---

# Solo el super administrador da de alta boxes y coaches

## Intent

Que ningún atleta pueda declararse coach o box. Un super administrador crea el equipo y asigna su dueño.

## Scope

- **In:** `GuestProfile.isSuperAdmin`; `canAdministerPlatform` (exige cuenta, no basta el flag); `requireSuperAdmin`; `/admin` (crear box/coach con correo del dueño, cambiar dueño; 404 para el resto); quitar `createTeam` y el formulario de `/coach`; quitar «¿Eres coach o tienes un box?» de `/box`; acceso en menú lateral y en Más solo para admin; `npm run admin:grant`; cuenta Admin en el seed.
- **Out:** varios administradores con permisos distintos; borrar equipos desde `/admin`; auditoría de cambios.

## Checklist

- [x] Regla pura con tests → `team-rules.test.ts` 21/21 (incluye «el flag sin cuenta no vale»).
- [x] El atleta no ve crear ni administración, y `/admin` da 404 → e2e.
- [x] El admin crea un box para una atleta y ella lo ve en su panel → e2e.
- [x] Correo sin cuenta da error claro → e2e.
- [x] La creación está protegida en servidor: `createTeam` ya no existe; `adminCreateTeam`/`adminSetTeamOwner` llaman a `requireSuperAdmin`.
- [x] `tsc`, lint 0 errores, `npm test` 85/85, `npm run test:e2e` 14/14, build OK.

## Evidence

2026-10-15: suites anteriores en verde; el equipo creado por el test se borra al final (solo quedan CrossFit Forja y Marcos Coaching). `npm run admin:grant -- --list` → `admin@wodtrace.test`.

## Next

Nombrar al super administrador real: que se registre en `/registro` y ejecutar `npm run admin:grant -- <su correo>`.
