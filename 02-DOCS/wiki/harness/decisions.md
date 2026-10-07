# Harness decisions

- Accepted plan `9e2a12ba1d108d52865939429da28b1b0ae67d568db448c0bb3ec2a37d6431ce`.
- Project kind: software.
- SDD: selected.

## [2026-10-06] harness scaffold

- Requisitos: completar el onboarding de rsc (faltaba la base de 01-TOOLS/ y 02-DOCS/).
- Opciones: aplicar el plan de auditoría / ajustarlo.
- Elección: aplicar. Tools creadas por evidencia: SUPABASE (deps @supabase/*), DB_CLI (dep pg + DATABASE_URL). Sin carpetas legacy ni borrados.
- Por qué: es lo que el código ya usa; sin herramientas especulativas.
