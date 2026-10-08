---
type: article
title: Sistema visual Zinc Teal
description: Paleta, tokens semánticos, tipografía y reglas de accesibilidad del sistema de diseño de WodTrace.
resource: ../../../Design.md
tags: [diseno, ui, accesibilidad]
timestamp: 2026-10-08T00:00:00Z
aliases: [design-system, forge-dark]
topic: diseno
status: draft
sources: [Design.md]
score: 0.0
---

# Sistema visual Zinc Teal

> Sources: Design.md, 2026-10-08
> Raw: [design-forge-dark](../../raw/diseno/design-forge-dark.md) (versión anterior, Forge Dark)

## Overview

Desde el 2026-10-08, WodTrace usa **Zinc Teal**: base zinc oscura con un único acento teal-400. Sustituye a Forge Dark, que tenía acento naranja-rojo.

- **Tokens:** viven en `src/app/globals.css`, con variante clara en `.light`.
- **Fuente de verdad:** `Design.md` §2.
- **Por qué este sistema:** ver la decisión del 2026-10-08 en [decisions](../harness/decisions.md).

## Tokens (tema oscuro)

| Token | HEX | Uso |
|-------|-----|-----|
| `background` / `surface` / `card` / `border` | `#09090B` / `#18181B` / `#27272A` / `#3F3F46` | Base zinc |
| `primary` / `primary-hover` | `#00D5BE` / `#46ECD5` | Acento único de marca |
| `on-primary` | `#09090B` | Texto sobre rellenos teal |
| `gold` | `#FBBF24` | PRs y logros |
| `info` | `#A3B3FF` | Información |
| `success` / `danger` | `#4ADE80` / `#FF6467` | Éxito / errores y acciones destructivas |
| Texto | `#FAFAFA` / `#D4D4D8` / `#A1A1AA` | Principal / secundario / atenuado |

## Reglas

- **Usa clases semánticas** (`bg-primary text-on-primary`), nunca hex en componentes. Constitución, principio 23.
- **Errores y destructivos en `danger`**, nunca en el acento de marca.
- **El éxito no se comunica solo con color**: tiene luminosidad parecida al teal.
- **En tema claro el acento baja a teal-700** `#00786F` con texto blanco.
- **Tipografía:** Barlow Condensed ExtraBold para titulares e Inter para la interfaz.
- **Accesibilidad:** objetivos táctiles de 48 px y WCAG AA.

## Related

- [Visión y alcance](../producto/vision-y-alcance.md): las pantallas a las que se aplica.
- [Paleta Zinc Teal (FTD)](../ftd/paleta-zinc-teal.md): cómo se implementó.
