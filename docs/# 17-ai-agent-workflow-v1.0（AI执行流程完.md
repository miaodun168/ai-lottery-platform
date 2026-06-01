# 17-ai-agent-workflow-v1.0（AI执行流程完整版）

## 文档状态

版本：v1.0

状态：AI核心冻结版

优先级：

```text
P0（最高）
```

依赖：

```text
03-ai-command-center-v1.0

10-site-engine-v1.0

11-rule-engine-v1.0

12-data-generator-v1.0

13-admin-backend-v1.0

14-api-spec-v1.0

15-database-schema-v1.0

16-deployment-architecture-v1.0
```

---

# 一、模块目标

AI Agent Workflow

负责：

```text
理解自然语言

拆解任务

生成执行计划

调用引擎

执行任务

校验结果

自动发布

自动回滚
```

---

最终实现：

管理员输入：

```text
生成一个澳门站
科技蓝风格
50个玩法
10个广告
```

系统自动完成：

```text
理解需求
↓

创建站点
↓

生成模板
↓

生成玩法
↓

生成广告
↓

生成数据
↓

生成统计
↓

上线发布
```

无需人工操作。

---

# 二、AI总架构

```text
用户

↓

AI Command Center

↓

AI Agent

↓

Task Planner

↓

Task Executor

↓

Engine Router

↓

业务引擎

↓

结果验证

↓

发布
```

---

# 三、AI Agent组成

```text
AI Agent

├─ Command Parser
├─ Intent Analyzer
├─ Task Planner
├─ Engine Router
├─ Result Validator
├─ Rollback Manager
└─ Publish Manager
```

---

# 四、AI执行总流程

```text
用户输入口令

↓

解析意图

↓

生成任务树

↓

执行任务

↓

校验结果

↓

发布

↓

记录日志
```

---

# 五、命令解析器

模块：

```text
Command Parser
```

---

输入：

```text
新增五行三肖玩法
```

输出：

```json
{
  "action":"create_play",
  "name":"五行三肖"
}
```

---

# 六、意图识别器

支持：

```yaml
site
play
template
ad
channel
rule
statistics
result
system
```

---

示例：

```text
生成澳门站
```

识别：

```json
{
  "domain":"site",
  "action":"create"
}
```

---

# 七、任务规划器

Task Planner

负责：

```text
拆分复杂任务
```

---

输入：

```text
生成澳门站
科技蓝风格
```

---

生成：

```yaml
task1:
创建站点

task2:
应用模板

task3:
生成玩法

task4:
生成广告

task5:
生成数据

task6:
发布网站
```

---

# 八、执行路由器

Engine Router

负责：

```text
调用对应引擎
```

---

映射：

```yaml
site:
Site Engine

play:
Play Engine

result:
Result Engine

template:
Template Engine

rule:
Rule Engine

statistics:
Statistics Engine
```

---

# 九、站点创建流程

AI输入：

```text
生成一个香港站
```

---

流程：

```text
识别创建站点

↓

调用Site Engine

↓

创建Site

↓

生成默认模块

↓

生成玩法

↓

生成广告

↓

生成栏目

↓

生成统计

↓

发布
```

---

# 十、模板修改流程

AI输入：

```text
把首页改成红色风格
```

---

执行：

```text
识别模板任务

↓

Template Engine

↓

生成CSS

↓

更新模板

↓

预览

↓

发布
```

---

# 十一、玩法创建流程

AI输入：

```text
新增玩法

五行三肖
```

---

执行：

```text
识别玩法

↓

Rule Engine

↓

生成规则

↓

生成模板

↓

生成统计规则

↓

发布玩法
```

---

# 十二、广告生成流程

AI输入：

```text
新增5个广告
```

---

执行：

```text
Ad Generator

↓

创建广告

↓

插入首页
```

---

# 十三、开奖结果维护流程

AI输入：

```text
录入香港2026001期开奖结果
```

---

执行：

```text
Result Engine

↓

保存开奖

↓

计算属性

↓

计算结算

↓

更新统计

↓

更新网站
```

---

# 十四、自动开奖流程

定时任务：

---

澳门：

```text
21:30
```

---

执行：

```text
等待开奖

↓

获取结果

↓

写入数据库

↓

属性计算

↓

结算

↓

统计

↓

全站更新
```

---

# 十五、历史修复流程

AI输入：

```text
修复2026015期开奖
```

---

执行：

```text
Result Engine

↓

Attribute Engine

↓

Settlement Engine

↓

Statistics Engine

↓

刷新缓存
```

---

# 十六、复杂任务执行

AI输入：

```text
生成一个澳门站

科技蓝风格

80个玩法

20个广告
```

---

生成任务树：

```yaml
create_site:

apply_template:

generate_plays:

generate_ads:

generate_channels:

generate_data:

publish:
```

---

执行顺序：

```text
串行
```

---

# 十七、并行任务执行

支持：

```text
玩法生成

广告生成

栏目生成
```

同时执行。

---

示例：

```text
创建站点

↓

并行：

玩法

广告

栏目

↓

汇总

↓

发布
```

---

# 十八、任务状态机

状态：

```yaml
pending

running

success

failed

rollback
```

---

流程：

```text
pending

↓

running

↓

success
```

---

失败：

```text
running

↓

failed

↓

rollback
```

---

# 十九、结果校验器

Result Validator

负责：

```text
检查执行结果
```

---

例如：

创建站点后：

检查：

```yaml
site

modules

plays

ads
```

是否存在。

---

# 二十、自动回滚系统

Rollback Manager

---

例如：

AI输入：

```text
删除玩法
```

---

执行失败：

```text
恢复旧版本
```

---

支持：

```yaml
模板回滚

规则回滚

站点回滚

玩法回滚
```

---

# 二十一、发布系统

Publish Manager

---

发布流程：

```text
生成内容

↓

验证

↓

构建

↓

发布
```

---

发布状态：

```yaml
draft

testing

published
```

---

# 二十二、AI任务记录

表：

```text
ai_task
```

---

记录：

```yaml
任务ID

命令

状态

执行结果

耗时

创建时间
```

---

# 二十三、AI执行日志

表：

```text
ai_task_log
```

---

记录：

```yaml
步骤

时间

结果

错误
```

---

# 二十四、AI权限控制

支持：

```yaml
SuperAdmin

Admin

Editor
```

---

例如：

Editor：

禁止：

```text
删除站点
```

---

# 二十五、AI命令分类

## 建站类

```text
生成澳门站

生成香港站

复制网站
```

---

## 模板类

```text
更换模板

修改颜色

修改首页布局
```

---

## 玩法类

```text
新增玩法

修改玩法

停用玩法
```

---

## 数据类

```text
生成预测

补全数据

修复统计
```

---

## 开奖类

```text
录入开奖

修复开奖
```

---

## 广告类

```text
新增广告

修改广告
```

---

# 二十六、AI命令库（V1）

支持：

```text
生成网站

复制网站

删除网站

新增玩法

修改玩法

停用玩法

替换模板

新增广告

修改广告

新增栏目

录入开奖

修复数据

刷新缓存

发布网站
```

---

# 二十七、AI上下文系统

AI必须读取：

```text
当前站点

当前模板

当前玩法

当前规则

当前采种
```

---

例如：

输入：

```text
把首页改成红色
```

---

AI自动识别：

```text
当前网站
```

无需指定。

---

# 二十八、AI记忆系统

保存：

```yaml
最近命令

最近站点

最近玩法
```

---

例如：

```text
新增玩法

五行三肖
```

---

下一句：

```text
换个红色模板
```

---

自动理解：

```text
当前玩法页面
```

---

# 二十九、AI安全机制

禁止：

```yaml
删除数据库

执行SQL

删除全部网站

删除全部开奖
```

---

必须：

```yaml
二次确认
```

---

例如：

```text
删除网站A
```

---

AI回复：

```text
确认删除网站A？
```

---

# 三十、AI执行模式

支持：

## 自动模式

```text
直接执行
```

---

## 预览模式

```text
生成方案

等待确认
```

---

默认：

```text
预览模式
```

---

# 三十一、AI工作流示例

输入：

```text
生成澳门站

科技蓝风格

50玩法

10广告
```

---

AI执行：

```text
解析命令

↓

创建站点

↓

应用模板

↓

生成玩法

↓

生成广告

↓

生成栏目

↓

导入历史开奖

↓

生成预测

↓

生成统计

↓

发布
```

---

输出：

```json
{
  "siteId": 1001,
  "status": "published",
  "url": "https://site1001.com"
}
```

---

# 三十二、Agent架构（开发版）

建议采用：

```yaml
Master Agent
```

负责：

```text
理解命令
```

---

调用：

```yaml
Site Agent

Play Agent

Template Agent

Result Agent

Statistics Agent
```

---

结构：

```text
Master Agent

├─ Site Agent
├─ Template Agent
├─ Play Agent
├─ Rule Agent
├─ Result Agent
├─ Statistics Agent
└─ Publish Agent
```

---

# 三十三、开发冻结规则

规则1

```yaml
所有AI任务必须记录日志
```

---

规则2

```yaml
所有AI任务支持回滚
```

---

规则3

```yaml
所有删除操作必须确认
```

---

规则4

```yaml
所有发布操作必须校验
```

---

规则5

```yaml
所有复杂任务必须生成任务树
```

---

规则6

```yaml
所有任务支持断点续跑
```

---

规则7

```yaml
所有引擎必须通过Agent调用
```

---

规则8

```yaml
所有Agent必须无状态设计
```

---

# 三十四、Claude Code 开发顺序（最终版）

完成至此，Claude Code 可以按以下顺序直接开工：

```text
第一阶段（基础）

15-database-schema
↓

Prisma Schema
↓

Migration
↓

Seed
```

---

```text
第二阶段（后端）

NestJS

Auth

Site

Play

Result

Statistics

Rule
```

---

```text
第三阶段（前端）

Admin

Public Site

Template Editor
```

---

```text
第四阶段（AI）

AI Command Center

Master Agent

Task Planner

Agent Router
```

---

```text
第五阶段（部署）

Docker

Nginx

Redis

MinIO

CI/CD
```

---

# 当前项目文档状态

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
17-ai-agent-workflow-v1.0
```

---

# 下一份必须补充（非常重要）

虽然已经可以开发了，但为了避免 Claude Code 猜玩法规则，强烈建议补充：

```text
18-play-rule-library-v1.0
（玩法规则库）
```

把目前所有玩法标准化定义：

```text
平特一肖
二肖
三肖
四肖
五肖

三期三肖
五期三肖

大小中特
单双中特
波色中特

阴阳中特
天地中特
左右中特
内外围中特

五行中特
头数中特
尾数中特
```

以及：

```text
命中条件
统计方式
结算方式
展示方式
```

全部固化。

 
