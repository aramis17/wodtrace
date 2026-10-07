# DB_CLI

Terminal access to the project's Postgres database.

## Setup

1. `cp .env.example .env && chmod 600 .env` and fill in.
2. `./test_connection.sh`
3. `./abrir_psql.sh` for an interactive session.

## Notes

- If the production DB does not expose a public port, set
  `SSH_HOST`/`SSH_USER` and the script will tunnel via SSH.
