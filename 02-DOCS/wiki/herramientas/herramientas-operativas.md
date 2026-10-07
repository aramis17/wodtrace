---
type: article
title: Herramientas operativas (01-TOOLS)
description: Qué tools hay en 01-TOOLS, para qué sirven y cómo probarlas.
resource: ../../../01-TOOLS/README.md
tags: [herramientas, supabase, postgres]
timestamp: 2026-10-06T00:00:00Z
aliases: [tools]
topic: herramientas
status: draft
sources: [01-TOOLS/README.md, 01-TOOLS/SUPABASE/CREDENTIALS.md, 01-TOOLS/DB_CLI/CREDENTIALS.md]
score: 0.0
---

# Herramientas operativas (01-TOOLS)

> Sources: 01-TOOLS/README.md, 2026-10-06
> Raw: [tools-readme](../../raw/herramientas/tools-readme.md); [supabase-credentials](../../raw/herramientas/supabase-credentials.md); [db-cli-credentials](../../raw/herramientas/db-cli-credentials.md)

## Overview

`01-TOOLS/` guarda la tooling de operación. No es código de la app. Cada proveedor tiene su carpeta, con su `.env` local (en `.gitignore`) y sus scripts.

| Tool | Uso |
|------|-----|
| `SUPABASE` | Comprobar el acceso a Auth, Storage y Postgres de Supabase. |
| `DB_CLI` | Abrir `psql` contra la base de datos (`abrir_psql.sh`). |

## Puesta en marcha

1. `cp 01-TOOLS/<TOOL>/.env.example 01-TOOLS/<TOOL>/.env` y rellenar los valores desde el dashboard.
2. Ejecutar `01-TOOLS/<TOOL>/test_connection.sh`.

Los `.env` de `01-TOOLS` son independientes del `.env` de la app.

## Related

- [Arquitectura general](../arquitectura/arquitectura-general.md): cómo usa la app Supabase y Postgres.
