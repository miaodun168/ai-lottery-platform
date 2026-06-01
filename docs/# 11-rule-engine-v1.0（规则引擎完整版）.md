# 11-rule-engine-v1.0（规则引擎完整版）

## 文档状态

版本：v1.0

状态：核心规则冻结版

优先级：

```text
P0（系统核心）
```

依赖：

```text
00-global-business-rules-v1.0
05-play-engine-v2.0
06-result-engine-v2.0
07-attribute-engine-v1.0
08-settlement-engine-v1.0
09-statistics-engine-v1.0
```

---

# 一、模块目标

Rule Engine（规则引擎）

负责：

```text
玩法规则管理

玩法规则解析

玩法规则执行

玩法规则生成

玩法规则扩展

AI自动创建玩法

AI自动修改玩法

AI自动生成结算逻辑
```

系统定位：

```text
规则引擎
    ↓
玩法引擎
    ↓
结算引擎
    ↓
统计引擎
```

---

# 二、为什么必须有规则引擎

没有规则引擎：

```text
新增一个玩法

↓

改数据库

↓

改代码

↓

改接口

↓

重新发布
```

---

有规则引擎：

```text
新增玩法

↓

新增规则

↓

立即生效
```

---

例如：

AI输入：

```text
新增玩法：

风雨雷电三肖
```

系统：

```text
自动创建玩法

自动生成判定规则

自动生成页面

自动生成统计
```

无需开发。

---

# 三、规则引擎架构

```text
Rule Engine

├─ Play Rule
├─ Settlement Rule
├─ Display Rule
├─ Statistics Rule
├─ Site Rule
└─ AI Rule
```

---

# 四、规则对象

统一规则模型：

```yaml
Rule:

id:

name:

code:

type:

version:

status:

expression:

config:
```

---

示例：

```yaml
id: 1001

name: 平特一肖

code: PTYX

type: play

status: active
```

---

# 五、规则分类

系统规则分：

```yaml
play_rule

settlement_rule

statistics_rule

display_rule

site_rule

system_rule
```

---

# 六、玩法规则

例如：

```yaml
平特一肖
```

规则：

```yaml
scope: all

target: zodiac

hit_condition:
any
```

---

含义：

```text
检查7个号码

任意一个生肖命中

即中奖
```

---

# 七、号码玩法规则

例如：

```yaml
平特二码
```

规则：

```yaml
scope: all

target: number

hit_condition:
any
```

---

含义：

```text
预测2个号码

开奖结果7个号码

任意命中
```

---

# 八、属性玩法规则

例如：

```yaml
大小中特
```

规则：

```yaml
scope: special

target: size
```

---

含义：

```text
只检查特码

属性为大小
```

---

# 九、组合玩法规则

例如：

```yaml
红波单
```

规则：

```yaml
target:
wave
odd_even
```

---

命中：

```yaml
operator:
and
```

---

含义：

```text
必须同时满足
```

---

# 十、多期玩法规则

例如：

```yaml
三期三肖
```

规则：

```yaml
group_period:
3

group_hit:
any
```

---

含义：

```text
3期一组

任意一期命中

整组命中
```

---

# 十一、规则表达式DSL

系统统一规则语言。

---

示例：

## 平特一肖

```yaml
exists(
 result.zodiac
 in prediction
)
```

---

## 大小中特

```yaml
result.special.size
=
prediction
```

---

## 红波中特

```yaml
result.special.wave
=
prediction
```

---

## 阴阳中特

```yaml
result.special.yin_yang
=
prediction
```

---

# 十二、规则执行器

流程：

```text
预测数据
    ↓
规则引擎
    ↓
解析规则
    ↓
执行表达式
    ↓
返回结果
```

---

返回：

```yaml
hit

miss
```

---

# 十三、AI自动生成玩法

AI输入：

```text
新增玩法：

五行三肖
```

---

系统分析：

```yaml
类型:
生肖玩法

属性:
五行

组数:
3
```

---

自动生成：

```yaml
play_rule

settlement_rule

statistics_rule

display_rule
```

---

自动创建玩法。

---

# 十四、AI自动修改玩法

例如：

AI输入：

```text
把三期三肖改成五期三肖
```

---

系统：

```yaml
group_period:
5
```

---

自动更新。

---

无需开发。

---

# 十五、规则版本系统

每个规则拥有版本。

---

示例：

```yaml
v1.0

v1.1

v2.0
```

---

记录：

```yaml
修改人

修改时间

修改内容
```

---

支持：

```yaml
回滚
```

---

# 十六、规则状态

支持：

```yaml
draft

testing

active

disabled
```

---

含义：

### draft

草稿

---

### testing

测试中

---

### active

启用

---

### disabled

停用

---

# 十七、展示规则

控制页面显示。

例如：

```yaml
连续错3期
```

规则：

```yaml
hide_history:
true
```

---

结果：

```text
隐藏历史预测
```

---

# 十八、更新中规则

规则：

```yaml
enable_updating_period:
true
```

---

配置：

```yaml
period_count:
2
```

---

显示：

```text
正在更新

正在更新
```

---

# 十九、统计规则

例如：

```yaml
统计近30期
```

规则：

```yaml
window:
30
```

---

生成：

```yaml
last_30_hit_rate
```

---

# 二十、站点规则

例如：

首页生成：

```yaml
play_count:
50

ad_count:
10

channel_count:
3
```

---

规则：

```yaml
lazy_load:
true
```

---

# 二十一、广告规则

例如：

```yaml
广告间隔：
5
```

---

表示：

```text
每5个玩法

插入1个广告
```

---

# 二十二、栏目规则

例如：

```yaml
栏目数:
3
```

---

默认：

```yaml
高手榜

历史回顾

资料中心
```

---

允许：

```yaml
AI新增

后台新增
```

---

# 二十三、开奖规则

香港：

```yaml
lottery_type:
HK
```

---

澳门：

```yaml
lottery_type:
MO
```

---

规则：

```yaml
独立运行
```

---

# 二十四、属性规则

固定属性：

```yaml
波色

单双

大小

左右

内外围
```

---

动态属性：

```yaml
生肖

五行
```

---

规则：

```yaml
历史快照冻结
```

---

# 二十五、规则依赖系统

例如：

```yaml
平特一肖
```

依赖：

```yaml
生肖规则
```

---

例如：

```yaml
五行中特
```

依赖：

```yaml
五行规则
```

---

系统自动检查。

---

# 二十六、规则冲突检测

例如：

规则A：

```yaml
特码
```

---

规则B：

```yaml
平码
```

---

同时存在：

```text
冲突
```

---

系统：

```yaml
status:
error
```

---

禁止上线。

---

# 二十七、规则测试系统

新规则创建：

自动执行：

```yaml
100期回测

1000期回测
```

---

验证：

```yaml
规则正确性

统计正确性

结算正确性
```

---

# 二十八、数据库表

## rule

```yaml
id

name

code

type

status

version

expression

config

created_at
```

---

## rule_version

```yaml
id

rule_id

version

content

created_at
```

---

## rule_dependency

```yaml
id

rule_id

dependency_rule_id
```

---

## rule_test_result

```yaml
id

rule_id

test_count

success_count

fail_count
```

---

# 二十九、AI口令支持

AI输入：

```text
新增玩法：

风肖三中三
```

---

系统：

```text
创建玩法
↓

生成规则
↓

生成模板
↓

生成统计
↓

生成页面
```

---

AI输入：

```text
删除玩法：

五行七码
```

---

系统：

```text
停用规则

保留历史数据
```

---

# 三十、开发强制规则

规则1

```yaml
所有玩法必须通过规则引擎创建
```

---

规则2

```yaml
禁止硬编码玩法规则
```

---

规则3

```yaml
新增玩法不得修改代码
```

---

规则4

```yaml
所有规则支持版本管理
```

---

规则5

```yaml
所有规则支持回滚
```

---

规则6

```yaml
规则修改必须保留历史记录
```

---

规则7

```yaml
规则变更不得影响历史快照
```

---

规则8

```yaml
规则上线前必须通过测试
```

---

# 三十一、V1开发范围

必须实现：

```text
玩法规则

结算规则

统计规则

展示规则

站点规则

规则DSL

规则执行器

规则版本管理

规则回滚

规则测试

规则依赖

规则冲突检测

AI自动创建玩法
```

---

# Rule Engine 最终目标

AI输入：

```text
新增玩法：

春夏秋冬三肖
```

系统自动完成：

```text
识别属性
    ↓
创建规则
    ↓
创建玩法
    ↓
创建模板
    ↓
创建统计
    ↓
创建页面
    ↓
上线生效
```

整个过程：

```text
无需开发人员改代码
无需重新部署
无需数据库重构
```

实现真正的：

```text
AI生成玩法
AI维护玩法
AI扩展玩法
```
