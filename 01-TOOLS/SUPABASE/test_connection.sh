#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a; source "$SCRIPT_DIR/.env"; set +a
: "${SUPABASE_URL:?SUPABASE_URL not set}"
: "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY not set}"
curl -fsS "${SUPABASE_URL%/}/auth/v1/health" -H "apikey: $SUPABASE_ANON_KEY" >/dev/null
echo "OK — Supabase auth service reachable."
