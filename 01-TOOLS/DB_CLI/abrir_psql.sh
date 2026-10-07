#!/usr/bin/env bash
# Opens an interactive psql session against the DB in .env.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a; source "$SCRIPT_DIR/.env"; set +a
if [ -n "${DATABASE_URL:-}" ]; then
  psql "$DATABASE_URL"
else
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER" -d "$POSTGRES_DB"
fi
