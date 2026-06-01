#!/usr/bin/env bash
set -e

ROOT=$(cd "$(dirname "$0")/.." && pwd)

echo ">>> 启动开发环境..."

# 复制环境变量
[ -f "$ROOT/.env" ] || cp "$ROOT/.env.example" "$ROOT/.env"

# 启动基础服务
docker compose -f "$ROOT/deploy/docker/docker-compose.yml" up -d postgres redis

echo ">>> PostgreSQL & Redis 已启动"

# 后端
cd "$ROOT/backend"
[ -d ".venv" ] || python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements.txt
uvicorn app.main:app --reload --port 8000 &
echo ">>> 后端运行在 http://localhost:8000"

# 前端
cd "$ROOT/frontend"
[ -d "node_modules" ] || npm install
npm run dev &
echo ">>> 前端运行在 http://localhost:5173"

wait
