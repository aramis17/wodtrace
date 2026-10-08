---
type: feature
title: Paleta Zinc Teal
topic: ftd
status: done
timestamp: 2026-10-08T00:00:00Z
---

# Paleta Zinc Teal

## Intent

Sustituir la paleta Forge Dark (acento naranja-rojo) por **Zinc Teal**, elegida en el lienzo de paletas:
- Base zinc oscura.
- Un único acento teal-400 `#00D5BE` con texto oscuro encima.
- Dorado para los PR e índigo para info.

Objetivos:
- Que los PR destaquen.
- Que la app se lea mejor en el box.
- Cumplir WCAG AA: hoy el botón blanco sobre `#FF3D23` da 3.5:1.

## Scope

- **In:**
  - Tokens de `globals.css` en tema oscuro y claro, con nombres semánticos: `primary`, `primary-hover`, `on-primary` y `danger`.
  - Renombrar las clases `ember` / `flame`.
  - Errores y acciones destructivas en `danger` (rojo), nunca en teal.
  - Colores escritos a mano en: anillo de progreso, gráfica, degradado de Inicio, `themeColor`, manifest e iconos SVG.
  - `Design.md` y la constitución (principio 19).
- **Out:**
  - Cambios de layout o componentes nuevos.
  - Cambios en la tipografía o en los colores estándar de los discos.

## Checklist

- [x] Tokens dark y light en `globals.css` (contrastes calculados ≥ 4.5:1).
- [x] `ember` → `primary` y `flame` → `primary-hover` en `src`; ningún uso de `ember` restante.
- [x] Rellenos de acento con `text-on-primary` (sin texto blanco sobre teal).
- [x] Errores y `danger` en el token `danger`.
- [x] Sin hex naranja hardcodeado en `src` ni en `public/*.svg`.
- [x] `Design.md` y la constitución actualizados.
- [x] Lint, tsc, tests y build en verde.
- [ ] Revisión visual en navegador (pendiente del usuario: el servidor dev no estaba corriendo).

## Evidence

- **Contraste (fórmula WCAG):**
  - Oscuro: `on-primary`/`primary` 10.7:1, `primary`/`card` 8.0:1, `text-muted`/`card` 5.8:1, `danger`/`card` 5.2:1, `info` sobre su tinte 5.5:1.
  - Claro: blanco sobre teal-700 5.4:1, red-600 4.8:1, indigo-600 6.5:1, amber-700 5.0:1, green-700 4.9:1, zinc-500 4.8:1.
- **Código:**
  - 51 clases `ember`/`flame` renombradas a `primary`/`primary-hover` en 21 archivos; `grep ember|flame` en clases da 0.
  - Errores de login y del toast pasan a `text-danger`; la variante `danger` del botón usa el token `danger`.
  - Los rellenos con texto usan `text-on-primary`. Solo quedan 2 rellenos decorativos sin texto.
- **Hex naranja:** 0 en `src` y en `public/*.svg`. Los iconos PNG se regeneraron con sharp (fondo `#09090B`, "WT" en `#00D5BE`).
- **Verificaciones:**
  - `tsc` sin errores; `npm run lint` 0 errores (1 warning previo ajeno); `npx vitest run` 67/67; `npm run build` compila.
  - El CSS compilado contiene `.bg-primary`, `.text-on-primary`, `.text-danger` y `hover:bg-primary-hover`, con las variables de los dos temas.

## Next

Abrir la app (`npm run dev`) y revisar Inicio, WODs, detalle, registrar, PRs y el tema claro.
