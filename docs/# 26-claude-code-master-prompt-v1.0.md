# 26-claude-code-master-prompt-v1.0

## 文档状态

版本：

```text
v1.0
```

状态：

```text
Claude Code 启动指令（冻结版）
```

优先级：

```text
P0
```

用途：

```text
作为 Claude Code 项目总指挥 Prompt

用于统一：

开发规范
架构规范
目录规范
编码规范
Agent协作规范
交付规范
```

---

# 一、项目身份定义

你正在开发：

```text
AI Website OS
```

项目目标：

```text
通过AI实现网站自动生成与自动运维

用户无需编程

无需后台操作

通过自然语言即可完成：

创建网站
修改网站
新增玩法
修改样式
新增页面
修改规则
部署网站
维护网站
```

---

# 二、核心原则

必须遵守：

```text
原则1：
配置驱动

原则2：
DSL驱动

原则3：
组件驱动

原则4：
AI驱动

原则5：
禁止硬编码业务逻辑

原则6：
禁止页面写死

原则7：
所有规则配置化

原则8：
所有玩法DSL化
```

---

# 三、项目文档清单

开发必须严格遵循以下文档：

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

17-ai-agent-workflow-v1.0

18-play-dsl-spec-v1.0

19-play-rule-library-v1.0

20-attribute-library-v1.0

21-ui-component-library-v1.0

22-theme-library-v1.0

23-site-layout-library-v1.0

24-ai-command-dictionary-v1.0

25-project-roadmap-v1.0
```

禁止擅自改变业务规则。

---

# 四、推荐技术栈

## Backend

```text
NestJS
TypeScript
Prisma
PostgreSQL
Redis
BullMQ
```

---

## Frontend

```text
Vue3
Vite
TypeScript
Pinia
Naive UI
TailwindCSS
```

---

## Website Runtime

```text
Nuxt3
SSR
SEO Friendly
```

---

## Infrastructure

```text
Docker

Docker Compose

Nginx

MinIO

CDN
```

---

## AI Layer

```text
OpenAI

Claude

DeepSeek

统一Provider模式
```

---

# 五、项目目录结构

必须采用 Monorepo：

```text
root/

apps/

    admin-web/

    site-runtime/

    api-server/

packages/

    play-engine/

    result-engine/

    settlement-engine/

    statistics-engine/

    rule-engine/

    attribute-engine/

    template-engine/

    ai-engine/

    site-engine/

    theme-engine/

    layout-engine/

    component-engine/

shared/

    database/

    types/

    constants/

    utils/

docs/
```

禁止混乱目录。

---

# 六、数据库开发规范

必须：

```text
Prisma Schema

Migration

Seed
```

全部实现。

---

数据库要求：

```text
支持版本升级

支持回滚

支持审计
```

---

禁止：

```text
直接修改生产表
```

---

# 七、玩法引擎开发规范

玩法必须：

```text
DSL驱动
```

禁止：

```text
if(play=="平特一肖")
```

这种写法。

---

正确方式：

```json
{
  "rule":"pt_1",
  "target":"attr_1",
  "count":1
}
```

---

由DSL解释器执行。

---

# 八、属性引擎开发规范

支持：

```text
生肖

波色

五行

大小

单双

左右

天地

家禽野兽

文武

阴阳

门数

段数
```

---

要求：

```text
支持扩展属性
```

---

新增属性时：

```text
无需改代码
```

---

# 九、开奖引擎开发规范

支持：

```text
香港

澳门
```

---

开奖方式：

```text
人工录入

接口录入（预留）
```

---

开奖结果固定：

```text
6个平码

1个特码
```

---

每个号码自动计算：

```text
生肖

波色

五行

全部属性
```

---

# 十、结算引擎规范

必须支持：

```text
单期玩法

多期玩法

绝杀玩法
```

---

支持：

```text
t_1

t_0

pt_1

multi_period
```

---

输出：

```json
{
  "hit":true,
  "period":"2026101"
}
```

---

# 十一、统计引擎规范

必须支持：

```text
总命中率

近10期

近30期

近100期
```

---

支持：

```text
排行榜

热门玩法

命中趋势
```

---

# 十二、网站引擎规范

网站：

```text
Theme
+
Layout
+
Component
=
Website
```

---

禁止：

```text
写死HTML页面
```

---

必须：

```text
组件树渲染
```

---

# 十三、组件引擎规范

所有页面：

```text
组件组成
```

例如：

```text
Logo

开奖

轮播

玩法

广告

栏目
```

---

组件必须：

```text
可替换

可拖拽

可隐藏

可AI修改
```

---

# 十四、主题引擎规范

主题：

```text
只负责视觉
```

禁止：

```text
主题包含业务逻辑
```

---

支持：

```text
继承

覆盖

实时切换
```

---

# 十五、布局引擎规范

布局：

```text
DSL描述
```

例如：

```yaml
layout:

- logo

- result_board

- play_card*5

- image_ad
```

---

AI只能修改DSL。

---

# 十六、AI系统规范

AI流程：

```text
用户输入

↓

Intent识别

↓

Command解析

↓

DSL生成

↓

执行

↓

返回结果
```

---

禁止：

```text
AI直接操作数据库
```

---

必须：

```text
AI → DSL → Engine
```

---

# 十七、权限规范

角色：

```text
Super Admin

Admin

Editor

Viewer
```

---

权限：

```text
RBAC
```

---

所有AI操作：

```text
记录日志
```

---

# 十八、日志规范

必须记录：

```text
用户操作

AI操作

开奖操作

规则修改

网站发布
```

---

支持：

```text
审计查询
```

---

# 十九、编码规范

统一：

```text
TypeScript
```

---

要求：

```text
ESLint

Prettier

Husky
```

---

命名：

```text
camelCase

PascalCase
```

---

禁止：

```text
any
```

---

# 二十、测试规范

必须实现：

```text
Unit Test

Integration Test

E2E Test
```

---

覆盖率：

```text
80%以上
```

---

重点覆盖：

```text
玩法引擎

结算引擎

统计引擎

AI解析器
```

---

# 二十一、CI/CD规范

Git流程：

```text
main

develop

feature/*
```

---

提交要求：

```text
lint

test

build
```

全部通过。

---

自动部署：

```text
Docker
```

---

# 二十二、Agent分工

Agent A：

```text
Database Team
```

---

Agent B：

```text
Play Engine Team
```

---

Agent C：

```text
Result Team
```

---

Agent D：

```text
Website Team
```

---

Agent E：

```text
Admin Team
```

---

Agent F：

```text
AI Team
```

---

禁止跨模块直接耦合。

统一：

```text
Interface
```

通信。

---

# 二十三、开发顺序

严格执行：

```text
Step1

Database

↓

Step2

Attribute Engine

↓

Step3

Result Engine

↓

Step4

Play Engine

↓

Step5

Settlement Engine

↓

Step6

Statistics Engine

↓

Step7

Site Engine

↓

Step8

Admin Backend

↓

Step9

AI Engine

↓

Step10

Deployment
```

---

# 二十四、MVP验收标准

必须实现：

```text
后台登录

创建网站

切换主题

切换布局

创建玩法

录入开奖

自动结算

自动统计

生成网站
```

---

# 二十五、最终验收标准

管理员输入：

```text
创建一个红金风格香港站
```

系统自动：

```text
创建网站

生成页面

生成玩法

生成广告

生成统计

部署上线
```

---

管理员输入：

```text
增加20个平特一肖

广告减半

首页改科技风
```

系统自动完成。

---

# 二十六、Claude Code执行指令

从现在开始：

```text
你不是代码补全工具。

你是本项目总架构师。

先创建项目目录结构。

再创建数据库Schema。

再创建核心Engine接口。

再实现Engine。

最后实现UI与AI。

禁止跳步骤。

禁止写死业务逻辑。

禁止违反DSL架构。

所有开发以文档为唯一事实来源（Single Source of Truth）。
```

---

# 最终启动口令

将下面这段直接发给 Claude Code：

```text
请作为本项目总架构师。

严格按照：
00-25全部文档执行开发。

采用Monorepo架构。

技术栈：
NestJS + Prisma + PostgreSQL + Redis + Vue3 + Nuxt3 + TypeScript。

先完成：

1. 项目目录结构
2. Prisma Schema
3. 核心Engine接口
4. 数据库Migration

完成后输出：

项目结构树
数据库ER图
Engine依赖图
Phase1开发计划

禁止直接开始写业务页面。
禁止跳过架构设计。
所有模块必须支持DSL扩展。
所有模块必须支持AI控制。
```

---


