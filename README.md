# WodTrace

PWA móvil-primero para registrar WODs, PRs y progreso de entrenamiento. El perfil demo compartido se carga al abrir la app para explorar la experiencia sin crear una cuenta.

Con cuenta (Supabase Auth, código por correo) cada atleta tiene su propio perfil y puede unirse a un **box** o a un **coach** para ver la programación diaria que le asignen, registrar resultados contra ella y ver el ranking del día. Un box programa el día para todos sus alumnos; un coach también puede programar de forma individual.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL (Supabase)
- Supabase Storage para fotos (fallback local en dev)
- Vercel-ready

## Setup

```bash
cp .env.example .env
# Edita DATABASE_URL y GUEST_SESSION_SECRET

npm install
npm run db:setup   # prisma db push + seeds
npm run dev
```

### Variables

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Postgres (pooled en runtime) |
| `DIRECT_URL` | Opcional, migraciones directas |
| `GUEST_SESSION_SECRET` | Firma JWT de sesión invitada (≥16 chars) |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth y Storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth (cuentas, box/coach). Sin ella la app queda solo en modo demo |
| `NEXT_PUBLIC_SITE_URL` | Origen público para los enlaces de login |
| `APP_TIME_ZONE` | Zona horaria que define "hoy" en la programación |
| `SUPABASE_SERVICE_ROLE_KEY` | Upload firmado (opcional) |
| `SUPABASE_STORAGE_BUCKET` | Default `result-photos` |

Sin Supabase Storage, las fotos se guardan en `public/uploads/`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `start` — producción
- `npm test` — unitarias (scoring, unidades, timers, discos)
- `npm run db:seed` — WODs, PRs, 4 niveles × estándares (124)
- `npm run lint`

## Rutas

`/`, `/activity`, `/wods`, `/wods/[id]`, `/timers`, `/prs`, `/prs/[id]`, `/settings`, `/tools/barbell`, `/login`, `/box`, `/box/[teamId]`, `/box/[teamId]/leaderboard`, `/coach`, `/coach/[teamId]` (+ `/members`, `/results`)

### Supabase Auth

En el panel de Supabase → Authentication:
- **URL Configuration**: añade `<NEXT_PUBLIC_SITE_URL>/auth/callback` a Redirect URLs.
- Opcional (requiere poder editar plantillas): en **Email Templates → Magic Link** incluye `{{ .Token }}` y pon `AUTH_EMAIL_CODE=true` para permitir entrar con código de 6 dígitos. Sin eso, el enlace del correo debe abrirse en el mismo navegador donde se pidió.

## Diseño

Ver `Design.md` (sistema **Forge Dark**).
