---
type: article
title: Visión y alcance de WodTrace
description: Qué es WodTrace, para quién es y qué funcionalidades cubre hoy.
resource: ../../../README.md
tags: [producto, alcance]
timestamp: 2026-10-06T00:00:00Z
aliases: [vision]
topic: producto
status: draft
sources: [README.md, IMPLEMENTATION_PLAN.md]
score: 0.0
---

# Visión y alcance de WodTrace

> Sources: README.md, 2026-10-06; IMPLEMENTATION_PLAN.md, 2026-10-06
> Raw: [readme](../../raw/producto/readme.md); [implementation-plan](../../raw/producto/implementation-plan.md)

## Overview

WodTrace es una PWA móvil-primero para registrar WODs, PRs y progreso de CrossFit. Toda la interfaz está en español.

- **Sin cuenta:** los visitantes usan un perfil demo compartido.
- **Con cuenta** (Supabase Auth, enlace por correo): cada atleta tiene su propio perfil y puede unirse a un box o a un coach.

## Funcionalidad

- **Inicio:** WOD destacado o programación asignada del día, totales y nivel atlético.
- **Actividad:** historial con filtros y edición o borrado de resultados.
- **Biblioteca WOD:** WODs semilla y personalizados, favoritos y registro según el tipo de puntuación.
- **Temporizadores:** AMRAP, EMOM, Tabata y For Time.
- **PRs:** catálogo, historial de intentos y gráfica.
- **Box y coach:**
  - Un equipo tiene un único dueño que programa.
  - Los alumnos se unen con un código y el dueño los aprueba.
  - Programación diaria publicada por bloques.
  - Ranking del día.
- **Herramientas:** calculadora de discos de barra.

## Fuera de alcance (por ahora)

- Pagos.
- RSS.
- Sincronización de perfiles invitados entre dispositivos.

## Related

- [Arquitectura general](../arquitectura/arquitectura-general.md): cómo se implementa.
- [Sistema visual Forge Dark](../diseno/forge-dark.md): cómo se ve.
