# WodTrace

PWA móvil-primero para registrar WODs, PRs y progreso de entrenamiento. El perfil demo compartido se carga al abrir la app para explorar la experiencia sin crear una cuenta.

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
| `NEXT_PUBLIC_SUPABASE_URL` | Storage (opcional) |
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

`/`, `/activity`, `/wods`, `/wods/[id]`, `/timers`, `/prs`, `/prs/[id]`, `/settings`, `/tools/barbell`

## Diseño

Ver `Design.md` (sistema **Forge Dark**).
