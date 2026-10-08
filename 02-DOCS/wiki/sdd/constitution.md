---
type: constitution
title: WodTrace — Constitution
description: The non-negotiable principles every rsc-sdd phase obeys.
tags: [sdd, constitution]
timestamp: 2026-10-07T00:00:00Z
topic: sdd
version: v1.1.0
---

# WodTrace — Constitution

> Version: v1.1.0 · Ratified: 2026-10-07 · Last amended: 2026-10-08
> The non-negotiable principles every rsc-sdd phase obeys. Mechanics live in `CLAUDE.md` and
> `02-DOCS/wiki/arquitectura/arquitectura-general.md`; this file ratifies the principle.

## 1. Stack canon

1. TypeScript on Next.js 16 App Router and React 19, styled with Tailwind CSS v4. Read the
   bundled guide in `node_modules/next/dist/docs/` before using a Next API (`AGENTS.md`).
2. Data lives in PostgreSQL (Supabase) through Prisma 7 with the `@prisma/adapter-pg` driver adapter.
   The client is imported from `@/generated/prisma/client`. Auth and Storage are Supabase. Changing
   any of these is a MAJOR amendment.
3. Package manager is npm, with one committed `package-lock.json`. Every new dependency is
   justified in the change that adds it.

## 2. Quality bar

4. `npm run lint` reports zero errors, and no new warnings, before a change is called done.
5. `tsc --noEmit` passes under `strict: true`. No `any` and no `@ts-ignore` without a comment
   saying why.
6. Every change to domain logic in `src/lib` (scoring, units, timers, barbell, team rules,
   ranking) ships with a Vitest test, and `npm test` passes. Server actions and UI are verified
   by running the app or with a smoke check, and the evidence is recorded.
7. `npm run build` succeeds before a change is called done.

## 3. Conventions

8. All user-facing copy is in Spanish.
9. Mutations are server actions in `src/lib/actions/*`. They validate `FormData` and return
   `{ error }`, `{ message }` or `{ redirectTo }`; expected failures are never thrown. The UI shows
   the outcome as a toast through `<ActionForm>`.
10. Every query is scoped to the current profile. Library listings use
    `OR: [{ isSeed: true }, { guestId }]`; opening a single workout uses `visibleWorkoutWhere`. Team
    data requires ownership (`requireTeamOwner`) or ACTIVE membership.
11. Weight is shown and entered in **pounds (lb) by default** (`DEFAULT_WEIGHT_UNIT`, `preferredWeightUnit` in `src/lib/units.ts`); a user may switch to kg in Settings. Storage stays in kg (`weightKg`), converted only at input and display.
12. A team has exactly one owner, who is the only one who programs. Members are always students.
13. Commit messages use gitmoji + Conventional Commits (`✨ feat(scope): subject`). Enforced by
    `.rsc/gitmoji-guard.mjs`.

## 4. Branching & shipping

14. Work goes directly on the default branch (`master`). No branch or PR is required.
15. **Git authorship is the human's.** No `Co-Authored-By` an AI, and no "generated with" footer
    in commits or PRs.

## 5. Security & privacy floor

16. No secret is ever committed. `.env` and `01-TOOLS/*/.env` stay gitignored, and only
    `.env.example` is tracked. `SUPABASE_SERVICE_ROLE_KEY` is used only on the server.
17. The shared demo profile is never linked to an account (`linkProfileToUser`). Features that
    need an identity call `requireAccount()`.
18. Redirect targets taken from user input pass through `safeNextPath`.

## 6. UX / accessibility floor

~~19. Meet WCAG 2.2 AA. Touch targets are at least 44–48 px, controls are real (`<button>`, `<a>`,
    `<label>`), icon-only buttons carry an `aria-label`, and keyboard navigation works. Visual
    tokens come from Forge Dark (`Design.md`, `src/app/globals.css`).~~ (superseded by 23)
20. Every screen works at phone width (mobile-first) first.
23. Meet WCAG 2.2 AA:
    - Touch targets are at least 44–48 px.
    - Controls are real elements (`<button>`, `<a>`, `<label>`).
    - Icon-only buttons carry an `aria-label`.
    - Keyboard navigation works.

    Colors come only from the **Zinc Teal** semantic tokens (`Design.md` §2, `src/app/globals.css`).
    Components never use raw hex values. The only exceptions are standard plate colors and
    generated assets.
    - Text on a `primary` fill uses `on-primary`, never white.
    - Errors and destructive actions use `danger`, never the brand accent.
    - Success is never signalled by color alone.

## 7. Knowledge & decisions

21. Every significant decision is appended to `02-DOCS/wiki/harness/decisions.md` (date,
    options, choice, why). The constitution is the highest-order decision record.
22. A change to architecture or conventions updates `CLAUDE.md` in the same change.

## Definition of Done (the merge bar `verify` runs against)

- [ ] Lint is clean and type checking passes (principles 4–5).
- [ ] Domain-logic tests are added and `npm test` is green; actions and UI are checked with recorded evidence (6).
- [ ] `npm run build` is green (7).
- [ ] Conventions are followed: Spanish copy, the action shape, profile-scoped queries, kg, the team model (8–12).
- [ ] The commit uses gitmoji, goes on `master` and has human authorship (13–15).
- [ ] No secret is committed and the security floor is met (16–18).
- [ ] Accessibility, Zinc Teal tokens and mobile-first hold (20, 23).
- [ ] Decisions are logged and `CLAUDE.md` is updated if needed (21–22).

## Amendment log (append-only)

| Date | Version | Change | Why |
|------|---------|--------|-----|
| 2026-10-07 | v1.0.0 | Ratified initial constitution. | rsc onboarding. Choices made: pure-logic tests, human-only authorship, no perf budget yet. Principle 11 set to lb display default before ratification. |
| 2026-10-08 | v1.1.0 | Principle 19 superseded by 23: Zinc Teal semantic tokens, `on-primary` text on fills, `danger` separate from the accent, success not color-only. | User chose the Zinc Teal palette. White text on the old `#FF3D23` CTA failed AA (3.5:1). |
