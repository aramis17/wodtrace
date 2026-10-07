---
type: article
title: Sistema visual Forge Dark
description: Paleta, tipografía y reglas de accesibilidad del sistema de diseño de WodTrace.
resource: ../../../Design.md
tags: [diseno, ui, accesibilidad]
timestamp: 2026-10-06T00:00:00Z
aliases: [design-system]
topic: diseno
status: draft
sources: [Design.md]
score: 0.0
---

# Sistema visual Forge Dark

> Sources: Design.md, 2026-10-06
> Raw: [design-forge-dark](../../raw/diseno/design-forge-dark.md)

## Overview

Forge Dark es un sistema en modo oscuro con acentos de alta energía, pensado para usarse en el gimnasio. Los tokens viven en `src/app/globals.css`, con variante clara en `.light`.

## Paleta

| Rol | HEX |
|-----|-----|
| Fondo | `#0B0C10` |
| Superficie | `#15171D` |
| Tarjeta | `#1C1F27` |
| Borde | `#343842` |
| Energía / CTA | `#FF3D23` (gradiente hasta `#FF6B35`) |
| Éxito | `#31D17C` |
| Logro / PR | `#FFB703` |
| Información | `#55C6FF` |
| Texto | `#FAFAFA` / `#B6B8C3` / `#858995` |

## Tipografía y reglas

- **Tipografía:** titulares en Barlow Condensed ExtraBold (mayúsculas); interfaz y lectura en Inter.
- **Interacción:** objetivos táctiles de 48 px, contraste WCAG AA y navegación por teclado.
- **Navegación:** barra inferior en móvil y panel lateral en escritorio.
- **Contraste conocido:** texto blanco sobre `#FF3D23` no llega a AA en tamaño normal. En botones, usa texto oscuro.

## Related

- [Visión y alcance](../producto/vision-y-alcance.md): las pantallas a las que se aplica.
