#!/usr/bin/env bash
# ─── Production Deploy ────────────────────────────────────────────────────────
# Builds all images and starts the full stack.
#
# Usage:
#   ./deploy/deploy.sh           # full build + start
#   ./deploy/deploy.sh --no-build  # restart without rebuild
# ─────────────────────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/deploy/docker/docker-compose.yml"

if [ ! -f "$ROOT/.env" ]; then
  echo "[ERROR] .env not found. Copy .env.example and fill in secrets."
  exit 1
fi

export $(grep -v '^#' "$ROOT/.env" | xargs)

if [ "$1" = "--no-build" ]; then
  echo "[deploy] Restarting services (no rebuild)..."
  $COMPOSE up -d
else
  echo "[deploy] Building images..."
  $COMPOSE build --no-cache server frontend

  echo "[deploy] Starting all services..."
  $COMPOSE up -d
fi

echo ""
echo "[deploy] Waiting for server health check..."
until $COMPOSE exec -T server wget -qO- http://localhost:3000/api/v1/lottery/types &>/dev/null; do
  sleep 3
  echo "  still waiting..."
done

echo ""
echo "───────────────────────────────────────"
echo "  Admin UI  →  http://localhost"
echo "  API       →  http://localhost/api/v1"
echo "  Swagger   →  http://localhost/api/docs"
echo "  MinIO UI  →  http://localhost:9001"
echo "───────────────────────────────────────"
$COMPOSE ps
