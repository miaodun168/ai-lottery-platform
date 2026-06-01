# AI Lottery Platform

基于 AI 的智能抽奖平台，支持多种抽奖模式、实时结果展示与数据分析。

## 项目结构

```
ai-lottery-platform/
├── docs/               # 项目文档
│   ├── api/            # API 接口文档
│   └── architecture/   # 架构设计文档
├── backend/            # 后端服务 (Python / FastAPI)
│   ├── app/
│   │   ├── api/        # 路由层
│   │   ├── core/       # 核心配置
│   │   ├── models/     # 数据模型
│   │   ├── services/   # 业务逻辑
│   │   └── utils/      # 工具函数
│   ├── tests/          # 单元/集成测试
│   └── alembic/        # 数据库迁移
├── frontend/           # 前端应用 (Vue 3 / React)
│   ├── src/
│   │   ├── components/ # 通用组件
│   │   ├── pages/      # 页面
│   │   ├── store/      # 状态管理
│   │   ├── hooks/      # 自定义 Hook
│   │   └── utils/      # 工具函数
│   └── public/
├── deploy/             # 部署配置
│   ├── docker/         # Dockerfile & Compose
│   ├── k8s/            # Kubernetes 清单
│   └── nginx/          # Nginx 配置
└── scripts/            # 运维脚本
```

## 快速开始

```bash
# 克隆仓库
git clone <repo-url>
cd ai-lottery-platform

# 启动开发环境
./scripts/dev.sh
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.11 · FastAPI · SQLAlchemy · Redis |
| 前端 | Vue 3 · Vite · Pinia · TailwindCSS |
| 数据库 | PostgreSQL · Redis |
| AI | OpenAI API / 本地模型 |
| 部署 | Docker · Nginx · (可选 K8s) |
