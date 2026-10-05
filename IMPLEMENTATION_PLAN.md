# WodTrace — Plan de web app de entrenamiento

## Resumen

Crear una app PWA móvil primero con Next.js, Prisma, PostgreSQL/Storage de Supabase y despliegue en Vercel. Será una prueba sin cuentas: cada navegador recibe un perfil invitado persistente mediante cookie segura, con sus propios datos locales en la nube.

Toda funcionalidad será gratuita: gráficas, fotos y registros estarán habilitados. No habrá pagos, RSS ni autenticación en esta fase.

## Funcionalidad

- Inicio: WOD destacado, totales, nivel atlético visual de cuatro niveles, progreso circular y resultados recientes.
- Actividad: historial cronológico, filtro por Todos/WODs/PRs/Estándares, selector de fecha, edición y eliminación confirmada desde el menú de cada resultado.
- Biblioteca WOD: búsqueda, favoritos, categorías semilla (Girls, Heroes, Open, Peso corporal, Benchmarks y Personalizados), listado completo y creación/edición de WOD personalizado.
- Detalle WOD: descripción, esquema de puntuación, escalados Rx/Escalado, favoritos, temporizador, gráfica de trayectoria cuando existan datos e historial de resultados.
- Registro de WOD: formulario dinámico según puntuación (`tiempo`, `reps y tiempo`, `peso`, `AMRAP`, `personalizado`), notas, fecha, Rx/Escalado y foto opcional.
- Temporizadores: AMRAP, EMOM, Tabata y por tiempo; ajuste de duración, cuenta regresiva, conteo de reps, iniciar/pausar/reiniciar y opción de mantener la pantalla activa.
- Récords personales: catálogo semilla, búsqueda, favoritos, creación y renombrado; detalle con historial, mejor intento, gráfica de progreso y registro de peso/reps/tiempo.
- Configuración: alias de atleta invitado, kg/lb, tema oscuro/claro/sistema, español, mantener pantalla encendida, calculadora de barra, temporizadores, ayuda, compartir, calificar, enlaces configurables y restablecimiento confirmado de datos.
- La sección RSS de los mockups queda fuera por la decisión de usar sólo contenido semilla; los WODs personalizados cubren la ampliación del catálogo.

## Arquitectura y datos

- Next.js App Router con TypeScript, Tailwind CSS, Server Actions para formularios, Route Handlers para cargas y `app/manifest.ts` para instalación móvil.
- Prisma sobre Supabase Postgres con conexión agrupada para Vercel; Supabase Storage para imágenes de resultados mediante URLs firmadas emitidas sólo tras validar la sesión invitada.
- Rutas principales: `/`, `/activity`, `/wods`, `/wods/[id]`, `/timers`, `/prs`, `/prs/[id]`, `/settings` y `/tools/barbell`.
- Tipos públicos centrales:
  - `ScoreType`: `TIME`, `REPS_TIME`, `WEIGHT`, `AMRAP`, `CUSTOM`.
  - `TimerMode`: `AMRAP`, `EMOM`, `TABATA`, `FOR_TIME`.
  - `Workout`, `WorkoutCategory`, `WorkoutResult`, `PersonalRecord`, `PersonalRecordAttempt`, `Favorite`, `MediaAsset`, `GuestProfile` y `Preference`.
- Semillas versionadas: WODs de las categorías mostradas, PRs frecuentes y los cuatro niveles atléticos con 124 metas de referencia. El nivel será visual en esta versión, sin desbloqueo automático.
- El perfil invitado se identifica con una cookie `HttpOnly`, aleatoria y firmada. No habrá sincronización entre dispositivos ni recuperación de datos hasta añadir autenticación.

## Diseño actualizado

- Actualizar `Design.md`: corregir codificación UTF-8, sustituir WODNexus por WodTrace y eliminar el azul como CTA principal.
- Sistema “Forge Dark”:
  - Fondo `#0B0C10`, superficie `#15171D`, tarjeta elevada `#1C1F27`, borde `#343842`.
  - Energía/CTA `#FF3D23`, gradiente hero `#FF3D23 → #FF6B35`, éxito `#31D17C`, logro `#FFB703`, información `#55C6FF`.
  - Texto `#FAFAFA`, secundario `#B6B8C3`, atenuado `#858995`.
- Titulares con Barlow Condensed ExtraBold para conservar el carácter deportivo de los mockups; Inter para interfaz y lectura.
- Mantener navegación inferior en móvil; en escritorio, contenedor centrado y panel lateral de navegación. Eliminar la imitación de la barra de estado del teléfono.
- Sustituir todos los candados y etiquetas Pro por gráficas reales, cargador de fotos y estados vacíos claros. Mantener objetivos táctiles de 48 px, contraste WCAG AA, navegación por teclado y mensajes de error accesibles.

## Validación y despliegue

- Pruebas unitarias para puntuación, selección de mejor resultado, conversión kg/lb, temporizadores y cálculo de discos.
- Pruebas de integración para semillas, favoritos, CRUD de WOD/PR/resultados, aislamiento de perfiles invitados, carga de foto y restablecimiento.
- Pruebas de interfaz en móvil y escritorio para filtros, formularios condicionados, estados vacíos, gráficas y navegación.
- Desplegar previews y producción en Vercel; configurar variables de Supabase, URL agrupada de base de datos para runtime y conexión directa para migraciones.
