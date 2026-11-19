#!/usr/bin/env bash
# Run on the VPS, inside the cloned repository: updates and restarts API + site.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Crie o .env a partir do .env.example antes do deploy." >&2; exit 1; }
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f >/dev/null
docker compose -f docker-compose.prod.yml ps
