#!/usr/bin/env bash
# Smoke-test against Postgres: pg_isready (local or via SSH).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_PATH="$SCRIPT_DIR/.env"
[ -f "$ENV_PATH" ] || { echo "ERROR: missing $ENV_PATH" >&2; exit 1; }
set -a; source "$ENV_PATH"; set +a

if [ -n "${SSH_HOST:-}" ] && [ -n "${SSH_USER:-}" ]; then
  ssh "${SSH_USER}@${SSH_HOST}" "pg_isready -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432}"
  echo "OK — Postgres reachable via ${SSH_USER}@${SSH_HOST}."
else
  : "${POSTGRES_HOST:?POSTGRES_HOST or DATABASE_URL not set}"
  pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}"
  echo "OK — Local Postgres reachable."
fi
