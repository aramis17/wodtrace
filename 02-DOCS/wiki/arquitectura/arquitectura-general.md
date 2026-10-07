---
type: article
title: Arquitectura general
description: Stack, resolución de perfil, propiedad de datos, equipos y patrón de mutaciones de WodTrace.
resource: ../../../CLAUDE.md
tags: [arquitectura, nextjs, prisma, supabase]
timestamp: 2026-10-06T00:00:00Z
aliases: [arquitectura]
topic: arquitectura
status: draft
sources: [CLAUDE.md]
score: 0.0
---

# Arquitectura general

> Sources: CLAUDE.md, 2026-10-06
> Raw: [claude-md](../../raw/arquitectura/claude-md.md)

## Overview

WodTrace usa Next.js 16 (App Router, React 19), TypeScript, Tailwind v4, Prisma 7 sobre Postgres (Supabase), Supabase Auth y Storage, y Vitest. `CLAUDE.md` es la fuente de verdad detallada; este artículo resume las decisiones transversales.

## Piezas clave

- **Prisma 7:**
  - El cliente se genera en `src/generated/prisma`.
  - La URL de conexión viene de `prisma.config.ts`.
  - En runtime usa el adaptador `@prisma/adapter-pg`.
- **Resolución de perfil:**
  - Todo cuelga de `GuestProfile.id`.
  - Primero se busca el perfil enlazado al usuario de Supabase Auth; si no hay, se usa la cookie `wt_guest`.
  - Los anónimos comparten el perfil demo.
  - `linkProfileToUser` nunca debe adoptar el perfil demo.
- **Propiedad de datos:**
  - Los WODs y PRs son semilla o personalizados por perfil.
  - `visibleWorkoutWhere` admite además los WODs de equipo.
- **Equipos:**
  - `Team` es de tipo `BOX` o `COACH`, con un único dueño. Los miembros son siempre alumnos.
  - La programación se organiza en `ProgrammingDay` (con su fecha) y `ProgrammingBlock`.
  - Los bloques puntuables tienen su propio `Workout`.
  - Los resultados quedan enlazados por `programmingBlockId` y alimentan el ranking.
- **Mutaciones:**
  - Son server actions que devuelven `{ error }`, `{ message }` o `{ redirectTo }`.
  - `<ActionForm>` muestra el resultado como toast (sonner).
  - Las páginas de datos usan `force-dynamic`.

## Related

- [Visión y alcance](../producto/vision-y-alcance.md): qué funcionalidades sostiene esta arquitectura.
- [Herramientas operativas](../herramientas/herramientas-operativas.md): acceso operativo a Supabase y Postgres.
