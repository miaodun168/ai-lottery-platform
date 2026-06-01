# 01-domain-model-v1.4（完整数据库领域模型版）

## 文档状态

版本：v1.4

阶段：数据库领域模型定稿版

用途：

* Claude Code 开发依据
* Cursor 开发依据
* 数据库设计依据
* API设计依据
* AI规则引擎依据

---

# 一、系统目标

构建AI驱动的：

* 多站点系统
* 多模板系统
* 多玩法系统
* 多广告系统
* 自动开奖系统
* 自动结算系统
* AI内容生成系统

支持：

```yaml
一个后台
管理多个网站

一个玩法
发布多个网站

一个模板
应用多个网站

一个AI
管理全部站点
```

---

# 二、核心领域模型

## Site（网站）

网站实体

```yaml
id:
name:
domain:
title:
keywords:
description:

status:
  enabled
  disabled

template_id:

style_id:

created_at:
updated_at:
```

---

## SiteSetting

网站配置

```yaml
id:

site_id:

logo:

favicon:

copyright:

seo_title:

seo_keywords:

seo_description:

announcement:

contact:

telegram:

whatsapp:
```

---

# 三、模板系统

## SiteTemplate

网站模板

```yaml
id:

name:

code:

preview_image:

description:

version:

status:

created_at:
updated_at:
```

---

## SiteTemplateVersion

模板版本

```yaml
id:

template_id:

version:

html_schema:

css_schema:

js_schema:

changelog:
```

---

## BlockTemplate

板块模板

```yaml
id:

name:

type:

preview_image:

description:

status:
```

---

## BlockTemplateVersion

```yaml
id:

block_template_id:

version:

schema:

style:
```

---

# 四、样式系统

## Style

样式实体

```yaml
id:

name:

theme:

primary_color:

secondary_color:

background_color:

font_family:

border_radius:

button_style:

card_style:
```

---

## StyleVersion

```yaml
id:

style_id:

version:

style_json:
```

---

# 五、站点页面系统

## Page

页面

```yaml
id:

site_id:

title:

slug:

type:

status:

seo_title:

seo_keywords:

seo_description:
```

---

## Block

页面板块

```yaml
id:

page_id:

name:

type:

template_id:

sort:

status:
```

---

# 六、开奖系统

## LotteryResult

开奖结果

```yaml
id:

issue:

open_time:

status:

numbers:
  - n1
  - n2
  - n3
  - n4
  - n5
  - n6

special:
```

---

## LotterySource

开奖来源

```yaml
id:

type:
  manual
  api

name:

config:

status:
```

---

# 七、号码属性系统

## NumberAttributeSnapshot

号码属性快照

```yaml
id:

result_id:

number:

position:

is_special:

zodiac:

element:

wave:

size:

odd_even:

head:

tail:

tail_size:

left_right:

inner_outer:

section7:
```

---

## NumberAttributeDefinition

号码属性定义

```yaml
id:

name:

code:

type:

rule_json:
```

---

# 八、生肖映射系统

## ZodiacYearMapping

年度生肖映射

```yaml
id:

year:

base_zodiac:

mapping_json:
```

示例：

```yaml
2026:

马:
  01
  13
  25
  37
  49
```

---

## ZodiacAttributeDefinition

生肖属性定义

```yaml
id:

name:

code:

animals:
```

例如：

```yaml
阴肖:

马
羊
猴
鸡
狗
猪
```

---

# 九、五行系统

## ElementYearMapping

年度五行映射

```yaml
id:

year:

ganzhi:

mapping_json:
```

60甲子循环。

---

# 十、玩法系统

## PlayCategory

玩法分类

```yaml
id:

name:

code:
```

例如：

```yaml
特码

平码

生肖

波色

五行

属性
```

---

## PlayRule

玩法规则

```yaml
id:

name:

code:

category_id:

description:

target_type:

scope:

period:

rule_json:

status:
```

---

## PlayTemplate

玩法模板

```yaml
id:

name:

template_id:

style_id:

schema:
```

---

## PlayContent

玩法内容

```yaml
id:

site_id:

play_rule_id:

issue:

content:

prediction:

result:

status:
```

---

# 十一、预测系统

## Prediction

预测记录

```yaml
id:

site_id:

play_id:

issue:

prediction_data:

period:

publish_time:
```

---

## PredictionSettlement

预测结算

```yaml
id:

prediction_id:

result_id:

is_hit:

hit_detail:

settlement_time:
```

---

# 十二、统计系统

## Statistics

统计实体

```yaml
id:

site_id:

play_id:

period:

hit_count:

miss_count:

hit_rate:
```

---

## Ranking

排行榜

```yaml
id:

site_id:

type:

score:

rank:
```

---

# 十三、广告系统

## AdTemplate

广告模板

```yaml
id:

name:

type:

template_json:
```

---

## Advertisement

广告内容

```yaml
id:

site_id:

template_id:

title:

content:

image:

link:

status:
```

---

# 十四、AI系统

## AICommand

AI口令

```yaml
id:

command:

input:

output:

status:
```

---

## AITask

AI任务

```yaml
id:

type:

status:

prompt:

result:

created_at:
```

支持：

```yaml
生成网站

替换模板

生成玩法

修改玩法

生成广告

修改广告

新增规则

批量更新
```

---

# 十五、历史回填系统

## HistoricalImportTask

```yaml
id:

site_id:

source:

status:

start_issue:

end_issue:
```

---

## HistoricalGenerationTask

```yaml
id:

site_id:

rule_id:

status:
```

---

# 十六、自动结算系统

## SettlementTask

```yaml
id:

issue:

status:

start_time:

finish_time:
```

流程：

```yaml
开奖

生成属性

生成快照

结算玩法

更新统计

更新排行榜

更新网站
```

---

# 十七、多站点系统

## SiteGroup

```yaml
id:

name:
```

---

## SiteRelation

```yaml
id:

group_id:

site_id:
```

支持：

```yaml
一个后台

多个网站
```

---

# 十八、用户权限系统

## User

```yaml
id:

username:

email:

password:

role:
```

---

## Role

```yaml
id:

name:
```

---

## Permission

```yaml
id:

name:

code:
```

---

# 十九、AI优先级原则

```yaml
AI生成
    ↓
人工审核
    ↓
人工修改
    ↓
最终发布
```

---

# 二十、人工覆盖原则

系统全部内容允许人工修改：

```yaml
网站

页面

模板

样式

玩法

预测

广告

开奖结果

统计

历史数据
```

人工修改优先级最高。

---

# 二十一、系统引擎总览

```yaml
Site Engine

Template Engine

Block Template Engine

Style Engine

Lottery Engine

Attribute Engine

Zodiac Engine

Element Engine

Rule Engine

Play Engine

Prediction Engine

Settlement Engine

Statistics Engine

Ranking Engine

Historical Backfill Engine

Ad Engine

AI Command Engine

AI Task Engine

Manual Override Engine
```

---

# 二十二、开发阶段规划

Phase 1

```yaml
多站点

开奖系统

属性系统

玩法系统

模板系统
```

Phase 2

```yaml
AI生成玩法

AI生成广告

AI生成网站
```

Phase 3

```yaml
自动运营

自动SEO

自动内容更新

自动模板优化
```

Phase 4

```yaml
完全AI站群系统
```
