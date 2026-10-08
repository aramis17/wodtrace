# Manual de Identidad Corporativa y Guía de Estilos UI

## 1. Visión General de la Marca

**WodTrace** es una plataforma digital de alto rendimiento diseñada para atletas, entrenadores y entusiastas del CrossFit. La identidad visual transmite **fuerza, precisión, conexión tecnológica y modernidad**, adoptando una estética *Dark Mode* optimizada para entornos deportivos y analíticos.

---

## 2. Sistema de color "Zinc Teal"

Base zinc neutra y oscura, con **un único acento teal** de marca. El dorado se reserva para los logros (PRs), así que destaca como el único color cálido de la pantalla. Los tokens viven en `src/app/globals.css`; usa siempre el token semántico (`bg-primary`, `text-on-primary`…), nunca el hex.

### 2.1 Colores (tema oscuro, por defecto)

| Token | Rol | HEX | Uso principal |
| :--- | :--- | :--- | :--- |
| `background` | Fondo base | `#09090B` (zinc-950) | Fondo general de la app |
| `surface` | Superficie | `#18181B` (zinc-900) | Barra de navegación, inputs |
| `card` | Tarjeta | `#27272A` (zinc-800) | Cards, modales, botón secundario |
| `border` | Borde | `#3F3F46` (zinc-700) | Divisores, outlines |
| `primary` | Acento de marca | `#00D5BE` (teal-400) | Botones primarios, estado activo, enlaces, gráficas, foco |
| `primary-hover` | Acento hover | `#46ECD5` (teal-300) | Hover de botones y enlaces |
| `on-primary` | Texto sobre acento | `#09090B` | Texto e iconos sobre rellenos teal (**nunca blanco**: 1.9:1) |
| `gold` | Logro | `#FBBF24` | PRs, mejor marca, nivel atlético |
| `info` | Información | `#A3B3FF` (indigo-300) | Tipo de puntuación, escalado, info secundaria |
| `success` | Éxito | `#4ADE80` | Completado (acompañar siempre con icono o texto: luminosidad similar al teal) |
| `danger` | Error / destructivo | `#FF6467` (red-400) | Errores, borrar, restablecer. **Nunca** usar el acento para errores |

### 2.2 Texto y neutros

| Token | HEX | Uso |
| :--- | :--- | :--- |
| `text-primary` | `#FAFAFA` | Titulares, texto principal |
| `text-secondary` | `#D4D4D8` (zinc-300) | Cuerpo, descripciones |
| `text-muted` | `#A1A1AA` (zinc-400) | Captions, fechas, deshabilitado (zinc-500 no pasa AA sobre `card`) |

### 2.3 Contraste (WCAG AA)

| Par | Ratio |
| :--- | :--- |
| `on-primary` sobre `primary` | 10.7:1 |
| `primary` sobre `card` / `background` | 8.0:1 / 10.7:1 |
| `text-muted` sobre `card` | 5.8:1 |
| `danger` sobre `card` | 5.2:1 |
| `info` sobre su fondo tintado (14 %) | 5.5:1 |

---

## 3. Tipografía

### 3.1 Familias

* **Titulares deportivos:** `Barlow Condensed` ExtraBold (800)
* **UI y lectura:** `Inter` (400 / 500 / 600)
* Fallback: `system-ui, -apple-system, sans-serif`

### 3.2 Jerarquía

```css
h1 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-primary);
}

h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-primary);
}

h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}

.caption {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}
```

---

## 4. Logotipo e iconografía

### 4.1 Marca

* **Concepto:** Rastro de esfuerzo / trazo de barra + llama de forja.
* **Fondo de icono:** `#09090B`
* **Acento:** `#00D5BE` (monograma "WT" en `public/icon-*.svg` / `.png`)

### 4.2 Iconos UI

* Estilo lineal, trazo 2px, uniones redondeadas
* Inactivo: `text-muted`
* Activo: `primary`

---

## 5. Componentes UI

### 5.1 Botones

* **Primario (CTA):** fondo `primary`, texto `on-primary` semibold, radius `12px`, min-height `48px`, sombra `0 4px 14px` del acento al 30 %
* **Secundario:** fondo `card`, borde `1px solid border`, texto `text-primary`
* **Ghost:** sin borde, texto `text-secondary`
* **Destructivo:** fondo `danger` al 15 %, texto `danger`, borde `danger` al 30 %

### 5.2 Tarjetas WOD

* Fondo `card`, borde `1px solid border`, padding `16px`, radius `16px`, gap interno `12px`

### 5.3 Badges

* **Éxito:** fondo `success` al 12 %, texto `success`
* **Info:** fondo `info` al 12 %, texto `info`
* **Logro / PR:** fondo `gold` al 12 %, texto `gold`
* **Marca:** fondo `primary` al 12 %, texto `primary`
* **Neutro:** fondo `border` al 40 %, texto `text-muted`

---

## 6. Layout y navegación

* **Móvil:** columna única, bottom navigation fija (Inicio, WODs, Box, Timers, PRs, Más)
* **Escritorio:** contenedor centrado (max-width ~480–560px en flujo móvil-primero) o layout con panel lateral de navegación
* **Sin** imitación de barra de estado del teléfono
* Objetivos táctiles mínimos **48×48 px**
* Contraste WCAG AA
* Navegación por teclado y mensajes de error accesibles

---

## 7. Tema claro / oscuro / sistema

* Por defecto: oscuro (Zinc Teal)
* Claro: fondo `#FAFAFA`, superficies blancas, bordes `#E4E4E7`, texto `#09090B` / `#3F3F46` / `#71717B`. El acento baja a **teal-700 `#00786F`** con texto blanco (5.4:1), porque teal-400 no pasa como texto sobre blanco. `danger` red-600, `gold` amber-700, `info` indigo-600, `success` green-700.
* Preferencia del usuario en ajustes; respetar `prefers-color-scheme` en modo sistema

---

## 8. Contenido gratuito

Todas las funciones están habilitadas: gráficas de progreso, carga de fotos, registros, favoritos y herramientas. No hay candados ni etiquetas Pro.
