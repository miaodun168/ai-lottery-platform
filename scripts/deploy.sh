#!/usr/bin/env bash
set -e

ROOT=$(cd "$(dirname "$0")/.." && pwd)

echo ">>> 构建并部署..."

docker compose -f "$ROOT/deploy/docker/docker-compose.yml" up -d --build

echo ">>> 部署完成"
echo "    后端: http://localhost:8000"
echo "    前端: http://localhost:3000"
