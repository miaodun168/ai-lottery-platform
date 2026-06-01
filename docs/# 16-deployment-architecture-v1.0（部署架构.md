# 16-deployment-architecture-v1.0（部署架构设计完整版）

## 文档状态

版本：v1.0

状态：生产架构冻结版

优先级：

```text
P0
```

依赖：

```text
02-system-architecture-v1.0

10-site-engine-v1.0

13-admin-backend-v1.0

14-api-spec-v1.0

15-database-schema-v1.0
```

---

# 一、架构目标

系统最终实现：

```text
AI建站

AI维护

AI运营

AI更新

多站点管理

自动扩容

自动部署
```

支持：

```text
100+

500+

1000+
```

网站同时运行。

---

# 二、总体架构

```text
用户
│
├─ 前台网站
│
├─ 后台管理
│
└─ AI控制中心
        │
        ▼

API Gateway

        │

 ┌─────────────┐
 │   NestJS    │
 └─────────────┘

        │

 ├─ Site Engine
 ├─ Play Engine
 ├─ Result Engine
 ├─ Attribute Engine
 ├─ Settlement Engine
 ├─ Statistics Engine
 ├─ Rule Engine
 ├─ AI Agent Engine

        │

 ├─ PostgreSQL
 ├─ Redis
 └─ Object Storage

        │

 CDN

        │

 网站用户
```

---

# 三、技术栈

## 后端

```yaml
Framework:
NestJS

Language:
TypeScript

ORM:
Prisma

Database:
PostgreSQL

Cache:
Redis

Queue:
BullMQ

Storage:
MinIO
```

---

## 前端

### 前台

```yaml
Next.js

React

TailwindCSS

Shadcn UI
```

---

### 后台

```yaml
Next.js

React

Ant Design
```

---

## AI

```yaml
Claude Code

OpenAI

DeepSeek

Gemini
```

统一Agent层管理。

---

# 四、服务器架构

## V1阶段

单机部署

```text
1台服务器
```

配置：

```yaml
CPU:
8核

RAM:
32GB

SSD:
500GB
```

---

部署：

```text
Docker

PostgreSQL

Redis

MinIO

NestJS

Next.js
```

即可支撑：

```text
100个网站
```

左右。

---

# 五、V2阶段

多机部署

```text
负载均衡
      │
 ┌────┴────┐
 │         │
API1     API2
 │         │
 └────┬────┘

 PostgreSQL

 Redis

 MinIO
```

---

支持：

```text
1000+
网站
```

---

# 六、Docker架构

## docker-compose

服务：

```yaml
nginx

frontend

admin

api

postgres

redis

minio

worker
```

---

容器：

```text
frontend
前台

admin
后台

api
接口

worker
任务处理

postgres
数据库

redis
缓存

minio
文件
```

---

# 七、Nginx架构

```text
Internet

     │

Nginx

     │

 ├─ frontend
 ├─ admin
 └─ api
```

---

域名：

```yaml
www.site.com

admin.site.com

api.site.com
```

---

# 八、多站点架构

系统支持：

```text
一个后台

管理多个网站
```

---

数据库：

```text
site_id
```

隔离。

---

例如：

```yaml
site_id=1

site_id=2

site_id=3
```

---

所有数据：

```text
玩法

广告

栏目

统计
```

均按：

```text
site_id
```

隔离。

---

# 九、静态资源架构

存储：

```yaml
Logo

广告图

轮播图

模板资源

截图
```

---

存储位置：

```yaml
MinIO
```

---

路径：

```text
/site/{siteId}/
```

---

例如：

```text
/site/1/logo.png

/site/1/banner.jpg
```

---

# 十、CDN架构

CDN缓存：

```yaml
图片

JS

CSS

字体

静态JSON
```

---

来源：

```yaml
MinIO
```

---

推荐：

```text
Cloudflare

腾讯云CDN

阿里云CDN
```

---

# 十一、数据库架构

数据库：

```yaml
PostgreSQL
```

---

库名：

```yaml
ai_site_system
```

---

字符集：

```yaml
UTF8
```

---

连接池：

```yaml
PgBouncer
```

V2启用。

---

# 十二、Redis架构

用途：

```yaml
缓存

排行榜

统计

会话

队列
```

---

缓存键：

```text
site:{id}

play:{id}

result:{type}:{period}

statistics:{play}
```

---

# 十三、消息队列

BullMQ

Redis驱动

---

任务：

```yaml
开奖更新

统计重建

AI任务

网站生成

模板生成

广告生成
```

---

# 十四、AI任务中心

AI命令：

```text
生成澳门站
```

---

流程：

```text
AI Command

↓

Task Queue

↓

Worker

↓

Site Engine

↓

Publish
```

---

全部异步执行。

---

# 十五、自动部署架构

Git

↓

GitHub

↓

GitHub Actions

↓

Docker Build

↓

Deploy

↓

Restart

---

流程：

```text
Push代码

↓

自动测试

↓

自动构建

↓

自动发布
```

---

# 十六、CI/CD流程

开发：

```text
Dev
```

↓

测试：

```text
Test
```

↓

生产：

```text
Prod
```

---

分支：

```yaml
main

develop

feature/*
```

---

# 十七、环境配置

## development

```yaml
APP_ENV=development
```

---

## test

```yaml
APP_ENV=test
```

---

## production

```yaml
APP_ENV=production
```

---

# 十八、自动备份

数据库：

每日备份

---

Redis：

每日备份

---

MinIO：

每日备份

---

保留：

```yaml
30天
```

---

# 十九、监控系统

推荐：

```yaml
Prometheus

Grafana
```

---

监控：

```yaml
CPU

内存

磁盘

数据库

Redis

队列

API
```

---

# 二十、日志系统

推荐：

```yaml
Loki

ELK
```

---

记录：

```yaml
系统日志

AI日志

开奖日志

错误日志
```

---

# 二十一、安全架构

## 登录

```yaml
JWT
```

---

## API

```yaml
Rate Limit
```

---

## 后台

```yaml
RBAC
```

---

## 数据库

```yaml
最小权限原则
```

---

# 二十二、HTTPS

全部强制：

```yaml
HTTPS
```

---

SSL：

```yaml
Let's Encrypt
```

---

自动续签。

---

# 二十三、容灾架构

数据库：

```yaml
主库
从库
```

V2启用。

---

Redis：

```yaml
主从
```

V2启用。

---

MinIO：

```yaml
集群
```

V3启用。

---

# 二十四、网站生成架构（核心）

AI输入：

```text
生成澳门站
```

---

系统：

```text
AI Agent
      │
      ▼

Site Engine

      │

生成站点

      │

生成玩法

      │

生成广告

      │

生成栏目

      │

生成模板

      │

生成数据

      │

发布上线
```

---

# 二十五、自动维护架构（核心）

开奖录入

↓

Result Engine

↓

Attribute Engine

↓

Settlement Engine

↓

Statistics Engine

↓

所有关联网站

↓

自动更新

---

即：

```text
2026年创建的网站

2028年仍自动维护
```

---

# 二十六、多采种架构

支持：

```yaml
HK

MO
```

---

数据隔离：

```text
result

prediction

settlement

statistics
```

均带：

```yaml
lottery_type
```

字段。

---

# 二十七、推荐服务器配置

## 第一阶段

预计：

```text
50~100网站
```

配置：

```yaml
8 Core

32GB RAM

500GB SSD
```

---

## 第二阶段

预计：

```text
500网站
```

配置：

```yaml
16 Core

64GB RAM

1TB SSD
```

---

## 第三阶段

预计：

```text
1000+网站
```

配置：

```yaml
Kubernetes
```

集群化。

---

# 二十八、Kubernetes（V3）

当站点超过：

```text
1000+
```

启用：

```yaml
K8S

Ingress

HPA

Helm
```

---

自动扩容：

```yaml
API

Worker

Frontend
```

---

# 二十九、Docker目录结构

```text
/project

├─ apps
│   ├─ frontend
│   ├─ admin
│   └─ api
│
├─ services
│   ├─ ai-agent
│   ├─ worker
│   └─ scheduler
│
├─ prisma
│
├─ docker
│
├─ nginx
│
└─ scripts
```

---

# 三十、开发冻结规则

规则1

```yaml
所有服务必须Docker化
```

---

规则2

```yaml
禁止直接部署Node
```

---

规则3

```yaml
所有环境变量必须.env管理
```

---

规则4

```yaml
所有任务必须队列化
```

---

规则5

```yaml
所有静态资源必须对象存储
```

---

规则6

```yaml
所有网站必须支持自动部署
```

---

规则7

```yaml
所有网站必须支持自动维护
```

---

规则8

```yaml
所有AI任务必须异步执行
```

---

# 三十一、V1实际开发部署方案（最终确定）

Claude Code 直接按照以下方案开发：

```yaml
Backend:
NestJS

Frontend:
Next.js

Admin:
Next.js + Antd

Database:
PostgreSQL

ORM:
Prisma

Cache:
Redis

Queue:
BullMQ

Storage:
MinIO

Proxy:
Nginx

Deploy:
Docker Compose

CI:
GitHub Actions
```

---

# 当前项目状态

已完成：

```text
00-global-business-rules-v1.0

01-domain-model-v1.4

02-system-architecture-v1.0

03-ai-command-center-v1.0

04-template-engine-v1.0

05-play-engine-v2.0

06-result-engine-v2.0

07-attribute-engine-v1.0

08-settlement-engine-v1.0

09-statistics-engine-v1.0

10-site-engine-v1.0

11-rule-engine-v1.0

12-data-generator-v1.0

13-admin-backend-v1.0

14-api-spec-v1.0

15-database-schema-v1.0

16-deployment-architecture-v1.0
```

---

## 下一份最关键文档

现在真正决定 AI 能否自动建站和自动维护的核心：

```text
17-ai-agent-workflow-v1.0
```

这份会定义：

```text
一句口令
↓

AI如何理解

↓

如何拆任务

↓

调用哪个引擎

↓

如何回滚

↓

如何自动发布
```

