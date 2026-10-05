# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

WodTrace is a mobile-first PWA for logging CrossFit WODs, personal records and progress. There are no user accounts: each browser gets a persistent guest profile. All UI copy is in Spanish. Product scope lives in `IMPLEMENTATION_PLAN.md`; the visual system ("Forge Dark": colors, Barlow Condensed headings + Inter body, 48px touch targets) lives in `Design.md`. `WebAppMockup/` holds the original reference mockups.

Stack: Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4, Prisma 7 on PostgreSQL (Supabase), Supabase Storage, Vitest.

## Commands

```bash
npm run dev            # dev server
npm run build          # prisma generate + next build
npm run lint           # eslint
npm test               # vitest run (all src/**/*.test.ts)
npx vitest run src/lib/scoring.test.ts      # single file
npx vitest run -t "selects best"            # single test by name
npm run db:setup       # prisma db push + seed (first-time setup)
npm run db:push        # sync schema to DB without migrations
npm run db:seed        # run prisma/seed.ts
npm run db:generate    # regenerate Prisma client
```

Setup: copy `.env.example` to `.env` and set `DATABASE_URL` (pooled) and `GUEST_SESSION_SECRET`. Supabase Storage vars are optional.

## Architecture

**Prisma 7 specifics.** The client is generated into `src/generated/prisma` (generator `prisma-client`, not the legacy `prisma-client-js`) and imported from `@/generated/prisma/client`. The connection URL comes from `prisma.config.ts`, not the schema's `datasource` block. Runtime uses the `@prisma/adapter-pg` driver adapter via the singleton in `src/lib/db.ts`. After editing `prisma/schema.prisma`, run `npm run db:generate` (it also runs on `postinstall`/`build`).

**Guest session flow.** This is the core cross-cutting mechanism:
1. The cookie `wt_guest` holds an HS256 JWT (`src/lib/guest-token.ts`) containing the guest id and a random raw token. The DB stores only `sha256(rawToken)` in `GuestProfile.tokenHash`, and both must match.
2. Server components can't set cookies, so `RootLayout` calls `getGuestOrNull()`. If that returns null, it renders `<GuestBootstrap>` (client), which calls `GET /api/guest/bootstrap` to create the profile and set the cookie, then calls `router.refresh()`.
3. Pages call `getGuestOrNull()` and render `<GuestLoading />` (`src/lib/guest-page.tsx`) when it returns null. Server actions call `requireGuest()`, which throws if there is no guest.
4. `src/proxy.ts` is Next 16's replacement for `middleware.ts`. It is currently a no-op passthrough and does not mint cookies, despite a stale comment in `guest.ts`.

**Data ownership.** `Workout` and `PersonalRecord` rows are either seed rows (`isSeed: true`, `guestId` null) or guest-owned custom rows (`isCustom: true`, `guestId` set). Queries must scope with `OR: [{ isSeed: true }, { guestId: guest.id }]`. Results, attempts, favorites and media are always guest-scoped. `Favorite` is polymorphic (`targetType` + `targetId`). `resetGuestData` in `src/lib/guest.ts` defines what a reset wipes.

**Mutations.** Forms use Server Actions in `src/lib/actions/*.ts` (`"use server"`). They read `FormData`, validate, and return `{ error }` on failure rather than throwing. On success they call `revalidatePath`. Data pages use `export const dynamic = "force-dynamic"` and query Prisma directly.

**Domain logic (pure, unit-tested) in `src/lib`:**
- `scoring.ts`: score types `TIME | REPS_TIME | WEIGHT | AMRAP | CUSTOM`. Handles time parsing, `formatScore`, and best-result selection (`isBetterScore`/`selectBestResult`), where lower time is better and higher weight/reps is better.
- `units.ts`: weight is always stored in kg (`weightKg`). Convert at input/display using the guest's `Preference.weightUnit`.
- `timers.ts`: AMRAP/EMOM/Tabata/For Time state logic used by `timer-panel.tsx`.
- `barbell.ts` / `barbell-inventory.ts`: plate calculator and user plate inventory.

**Photos.** `src/lib/storage.ts` uploads to Supabase Storage when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Otherwise it writes to `public/uploads/` (dev fallback).

**Seeds.** `prisma/seed.ts` is gated by `SeedMeta.version` against `SEED_VERSION`. Bump `SEED_VERSION` when you change `prisma/seed-data.ts`, or the seed will skip.

**Tests** are Vitest in a node environment and cover pure logic only. `*.integration.test.ts` files do not hit a database. The `@` alias maps to `src/`.

## OpenSpec

Feature work follows OpenSpec's spec-driven flow: `openspec/changes/<change>/` contains `proposal.md`, `design.md`, `tasks.md` and `specs/`. Completed changes move to `openspec/changes/archive/`.
