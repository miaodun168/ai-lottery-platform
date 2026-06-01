# 06-result-engine-v2.0（开奖结果引擎设计）

## 文档状态

版本：v2.0

状态：规则冻结版

依赖：

* 01-domain-model-v1.4
* 05-play-engine-v2.0
* 07-attribute-engine-v1.0

---

# 一、模块目标

开奖结果引擎（Result Engine）负责：

* 开奖结果录入
* 开奖结果管理
* 开奖结果验证
* 属性快照生成
* 玩法结算触发
* 历史开奖维护
* 开奖修复
* 开奖回滚
* 开奖版本管理

系统定位：

```text
开奖结果
    ↓
属性计算
    ↓
玩法判定
    ↓
统计更新
    ↓
网站更新
```

---

# 二、开奖结果结构

每期开奖结果固定：

```yaml
7个号码
```

结构：

```yaml
n1:
n2:
n3:
n4:
n5:
n6:

special:
```

---

# 三、全局业务规则

## 平码

前6个号码

```yaml
n1
n2
n3
n4
n5
n6
```

---

## 特码

最后1个号码

```yaml
special
```

---

示例：

```yaml
issue:
2026001

n1: 01
n2: 13
n3: 22
n4: 35
n5: 41
n6: 46

special: 49
```

对应：

```yaml
平码:

01
13
22
35
41
46

特码:

49
```

---

# 四、开奖结果模型

## LotteryResult

```yaml
id:

issue:

open_date:

open_time:

year:

status:

source:

n1:

n2:

n3:

n4:

n5:

n6:

special:

created_at:

updated_at:
```

---

# 五、开奖来源

## SourceType

```yaml
MANUAL

API
```

---

## MANUAL

人工录入

管理员输入：

```yaml
期号

7个号码
```

系统自动处理。

---

## API

接口获取

V1保留接口。

V2开发。

---

# 六、开奖结果状态

```yaml
draft

published

settled

rollback

deleted
```

---

## draft

已录入

未发布

---

## published

已发布

未结算

---

## settled

已完成结算

---

## rollback

已回滚

---

## deleted

逻辑删除

---

# 七、开奖录入流程

```text
录入开奖结果
        ↓
数据验证
        ↓
生成属性快照
        ↓
保存开奖结果
        ↓
发布开奖结果
        ↓
创建结算任务
        ↓
更新统计
        ↓
更新网站
```

---

# 八、开奖结果验证

## 数量验证

必须：

```yaml
7个号码
```

否则拒绝。

---

## 范围验证

号码范围：

```yaml
1-49
```

---

## 重复验证

禁止：

```yaml
01
01
```

重复号码。

---

## 期号验证

禁止：

```yaml
重复期号
```

---

## 状态验证

已结算开奖：

```yaml
禁止直接修改
```

必须走修复流程。

---

# 九、开奖属性快照

开奖录入后：

立即生成属性快照。

---

原因：

```text
生肖每年变化

五行每年变化
```

历史数据必须永久保存。

---

## NumberSnapshot

```yaml
id:

issue:

number:

position:

is_special:
```

---

# 十、号码属性快照

每个号码保存：

```yaml
number

wave

size

odd_even

sum_odd_even

sum_size

tail

tail_size

head

head_tail

left_right

inner_outer

section
```

---

示例

```yaml
number:
49

wave:
绿波

size:
大

odd_even:
单

tail:
9

tail_size:
大尾

left_right:
右边

inner_outer:
外围
```

---

# 十一、生肖快照

必须保存。

例如：

2026年

```yaml
马:
01
13
25
37
49
```

---

保存：

```yaml
zodiac:
马
```

---

而不是动态计算。

---

# 十二、五行快照

必须保存。

例如：

```yaml
49

五行:
金
```

---

保存：

```yaml
element:
金
```

---

避免未来五行变化。

---

# 十三、生肖属性快照

同时保存：

```yaml
阴阳肖

日夜肖

左右肖

天地肖

朝夕肖

风雨雷电

琴棋书画

梅兰竹菊

三合

六合

四大美女

四大家臣

有肖无肖

有边无边

大小肖

肥瘦肖

胆大胆小

月份肖

汉号肖
```

---

# 十四、开奖快照机制

核心规则：

```yaml
开奖结果发布后

生成永久快照
```

---

历史数据：

```yaml
永不动态计算
```

---

即：

```yaml
开奖
+
号码属性
+
生肖属性
+
五行属性
```

一次性固化。

---

# 十五、开奖修改机制

支持：

```yaml
修改历史开奖
```

例如：

```yaml
2026001

49

改为

48
```

---

执行：

```text
创建新版本
      ↓
删除原结算
      ↓
重新生成快照
      ↓
重新结算玩法
      ↓
重新统计
```

---

# 十六、开奖回滚机制

管理员：

```text
回滚2026001
```

---

系统：

```text
恢复上一版本

重新生成结算
```

---

# 十七、开奖版本管理

## ResultVersion

```yaml
id:

result_id:

version:

operator:

change_reason:

snapshot_data:

created_at:
```

---

示例：

```yaml
v1

49
```

---

```yaml
v2

48
```

---

全部保留。

---

# 十八、自动结算触发器

开奖发布：

自动创建：

```yaml
SettlementTask
```

---

流程：

```text
开奖结果
      ↓
属性快照
      ↓
玩法判定
      ↓
生成结算
      ↓
更新统计
      ↓
更新排行榜
      ↓
更新网站
```

---

# 十九、多期玩法支持

例如：

```yaml
三期三肖
```

---

开奖后：

自动检查：

```yaml
当前期

上一期

上两期
```

---

更新：

```yaml
multi_period_settlement
```

---

# 二十、历史开奖导入

首次建站：

支持：

```yaml
100期

500期

1000期

全部历史
```

---

流程：

```text
导入开奖
      ↓
生成属性快照
      ↓
生成结算
      ↓
生成统计
      ↓
生成排行榜
```

---

# 二十一、开奖结果缓存

Redis

---

当前期：

```yaml
result:current
```

---

最新20期：

```yaml
result:last20
```

---

最新100期：

```yaml
result:last100
```

---

属性缓存：

```yaml
result:attribute
```

---

# 二十二、数据库表

```yaml
lottery_result

lottery_result_version

lottery_result_snapshot

lottery_result_attribute

lottery_result_zodiac

lottery_result_element

result_settlement_task
```

---

# 二十三、与其它引擎关系

```text
Result Engine
        │
        ▼

Attribute Engine
        │
        ▼

Play Engine
        │
        ▼

Settlement Engine
        │
        ▼

Statistics Engine
        │
        ▼

Website Engine
```

---

# 二十四、开发强制规则

规则1

开奖结果固定：

```yaml
7个号码
```

---

规则2

前6个号码：

```yaml
平码
```

---

规则3

最后1个号码：

```yaml
特码
```

---

规则4

开奖发布后：

```yaml
必须生成快照
```

---

规则5

历史数据：

```yaml
禁止动态重新计算生肖
禁止动态重新计算五行
```

---

规则6

修改开奖：

```yaml
必须重新结算
```

---

规则7

所有玩法必须引用开奖表

禁止直接读取预测表。

---

# 二十五、V1开发范围

必须实现：

* 人工录入开奖
* 开奖验证
* 属性快照
* 开奖发布
* 开奖修改
* 开奖回滚
* 开奖版本管理
* 自动结算触发
* 历史开奖导入
* Redis缓存

---

# 二十六、V2开发范围

实现：

* API自动开奖
* 多数据源校验
* 开奖异常报警
* 自动修复
* 开奖监控中心

---

# Result Engine 最终目标

管理员输入：

```text
录入开奖结果

期号：
2026123

号码：

01
13
22
35
41
46

特码：

49
```

系统自动完成：

```text
验证号码

生成生肖

生成五行

生成全部属性

生成快照

结算玩法

更新统计

更新排行榜

更新网站
```

无需人工参与后续操作。
