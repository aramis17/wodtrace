# SEED — cuentas y datos de demostración

`npm run db:seed:showcase` crea dos equipos (box **CrossFit Forja** y coach **Marcos Coaching**), sus tracks, cuatro semanas de programación alrededor de hoy, resultados, PRs y siete cuentas de Supabase Auth con contraseña.

- Requiere en `.env`: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Contraseña: `SEED_USER_PASSWORD` en `.env`; si falta, se genera una al azar en cada ejecución.
- Las credenciales quedan en `CREDENTIALS.local.md` (esta carpeta). **Está en `.gitignore`: no se sube.**
- Se puede repetir: reconstruye los dos equipos (ids `seed-team-*`) y vuelve a fijar la contraseña. No toca otros datos.
- Los correos son `@wodtrace.test`: no reciben email, solo sirven para entrar con contraseña.
- "Entrar con contraseña" aparece en `/login` en desarrollo, o en producción con `AUTH_PASSWORD_LOGIN=true`.
