#!/usr/bin/env bash
# ─── Local Development ────────────────────────────────────────────────────────
# Starts postgres + redis in Docker, then runs NestJS + Vue3 locally.
#
# Prerequisites: Docker, Node 20+
# Usage:  ./deploy/dev.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 1. Ensure .env exists
if [ ! -f "$ROOT/.env" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "[dev] Copied .env.example → .env  (edit secrets if needed)"
fi

# 2. Start infrastructure only (postgres + redis)
echo "[dev] Starting postgres & redis..."
docker compose \
  -f "$ROOT/deploy/docker/docker-compose.yml" \
  up -d postgres redis

# 3. Wait for postgres
echo "[dev] Waiting for postgres..."
until docker exec lottery_postgres pg_isready -U lottery -d lottery_db &>/dev/null; do
  sleep 1
done
echo "[dev] postgres ready."

# 4. Run Prisma migrations (from server dir)
echo "[dev] Running prisma migrate..."
cd "$ROOT/server"
DATABASE_URL="postgresql://lottery:lottery_pass@localhost:5432/lottery_db" \
  npx prisma migrate deploy

# 5. Start NestJS dev server (background)
echo "[dev] Starting NestJS (port 3000)..."
DATABASE_URL="postgresql://lottery:lottery_pass@localhost:5432/lottery_db" \
JWT_SECRET="dev-secret" \
  npm run start:dev &
SERVER_PID=$!

# 6. Start Vue3 dev server (background)
echo "[dev] Starting Vue3 admin (port 5173)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "───────────────────────────────────────"
echo "  NestJS API  →  http://localhost:3000/api/v1"
echo "  Swagger     →  http://localhost:3000/api/docs"
echo "  Admin UI    →  http://localhost:5173"
echo "───────────────────────────────────────"
echo "  Ctrl+C to stop all services"

# Trap Ctrl+C → kill background processes
trap "kill $SERVER_PID $FRONTEND_PID 2>/dev/null; docker compose -f '$ROOT/deploy/docker/docker-compose.yml' stop postgres redis; exit 0" INT TERM

wait
