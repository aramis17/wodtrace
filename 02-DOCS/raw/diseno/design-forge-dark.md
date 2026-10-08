# Manual de Identidad Corporativa y Guía de Estilos UI

> Source: Design.md (workspace)
> Collected: 2026-10-06
> Published: Unknown

# Manual de Identidad Corporativa y Guía de Estilos UI

## 1. Visión General de la Marca

**WodTrace** es una plataforma digital de alto rendimiento diseñada para atletas, entrenadores y entusiastas del CrossFit. La identidad visual transmite **fuerza, precisión, conexión tecnológica y modernidad**, adoptando una estética *Dark Mode* optimizada para entornos deportivos y analíticos.

---

## 2. Sistema de color “Forge Dark”

La paleta se estructura sobre tonos oscuros profundos con acentos de alta energía en naranja-rojo forja.

### 2.1 Colores principales

| Rol | Nombre | HEX | Uso principal |
| :--- | :--- | :--- | :--- |
| **Fondo base** | Forge Black | `#0B0C10` | Fondo general de la app |
| **Superficie** | Forge Surface | `#15171D` | Barras, paneles, navegación |
| **Tarjeta elevada** | Forge Card | `#1C1F27` | Cards, modales, contenedores |
| **Borde** | Forge Border | `#343842` | Divisores, outlines |
| **Energía / CTA** | Forge Ember | `#FF3D23` | Botones primarios, estados activos |
| **Gradiente hero** | Ember → Flame | `#FF3D23 → #FF6B35` | Headers, destacados |
| **Éxito** | Performance Green | `#31D17C` | Completado, métricas positivas |
| **Logro** | Gold Medal | `#FFB703` | PRs, hitos, nivel atlético |
| **Información** | Signal Blue | `#55C6FF` | Info, enlaces secundarios |

### 2.2 Texto y neutros

| Rol | HEX | Uso |
| :--- | :--- | :--- |
| **Texto primario** | `#FAFAFA` | Titulares, texto principal |
| **Texto secundario** | `#B6B8C3` | Cuerpo, descripciones |
| **Texto atenuado** | `#858995` | Captions, timestamps, deshabilitado |

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
  color: #FAFAFA;
}

h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #FAFAFA;
}

h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #FAFAFA;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.5;
  color: #B6B8C3;
}

.caption {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: #858995;
}
```

---

## 4. Logotipo e iconografía

### 4.1 Marca

* **Concepto:** Rastro de esfuerzo / trazo de barra + llama de forja.
* **Fondo de icono:** `#0B0C10`
* **Acento:** `#FF3D23` con glow sutil

### 4.2 Iconos UI

* Estilo lineal, trazo 2px, uniones redondeadas
* Inactivo: `#858995`
* Activo: `#FF3D23`

---

## 5. Componentes UI

### 5.1 Botones

* **Primario (CTA):** fondo `#FF3D23`, texto `#FAFAFA`, radius `12px`, min-height `48px`, sombra `0 4px 14px rgba(255, 61, 35, 0.35)`
* **Secundario:** fondo transparente o `#1C1F27`, borde `1px solid #343842`, texto `#FAFAFA`
* **Ghost:** sin borde, texto `#B6B8C3`

### 5.2 Tarjetas WOD

* Fondo `#1C1F27`, borde `1px solid #343842`, padding `16px`, radius `16px`, gap interno `12px`

### 5.3 Badges

* **Éxito:** fondo `#31D17C1F`, texto `#31D17C`
* **Info:** fondo `#55C6FF1F`, texto `#55C6FF`
* **Logro / PR:** fondo `#FFB7031F`, texto `#FFB703`
* **Energía:** fondo `#FF3D231F`, texto `#FF3D23`

---

## 6. Layout y navegación

* **Móvil:** columna única, bottom navigation fija (Inicio, Actividad, WODs, Timers, PRs, Más)
* **Escritorio:** contenedor centrado (max-width ~480–560px en flujo móvil-primero) o layout con panel lateral de navegación
* **Sin** imitación de barra de estado del teléfono
* Objetivos táctiles mínimos **48×48 px**
* Contraste WCAG AA
* Navegación por teclado y mensajes de error accesibles

---

## 7. Tema claro / oscuro / sistema

* Por defecto: oscuro (Forge Dark)
* Claro: invertir superficies a grises claros manteniendo CTA `#FF3D23`
* Preferencia del usuario en ajustes; respetar `prefers-color-scheme` en modo sistema

---

## 8. Contenido gratuito

Todas las funciones están habilitadas: gráficas de progreso, carga de fotos, registros, favoritos y herramientas. No hay candados ni etiquetas Pro.
