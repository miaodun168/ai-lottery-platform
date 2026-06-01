下面这版已经根据你最新业务规则全部修正：

核心变化：

✅ 全年预测一次生成
✅ 香港澳门独立生成
✅ 不允许开奖后生成预测
✅ 支持重新生成全年预测
✅ 支持AI生成数据
✅ 支持规则模板生成数据
✅ 支持玩法批量生成
✅ 支持预测批次管理
✅ 支持历史重建

---

# 12-data-generator-v1.1（数据生成引擎完整版）

## 文档状态

版本

```text
v1.1
```

状态

```text
冻结版
```

优先级

```text
P0
```

依赖

```text
00-global-business-rules-v1.1

05-play-engine-v2.0

07-attribute-engine-v1.0

19-play-rule-library-v1.0

20-attribute-library-v1.0

15-database-schema-v1.1
```

---

# 一、引擎职责

Data Generator负责：

```text
生成预测数据

生成全年数据

生成历史数据

生成玩法数据

生成AI数据

生成测试数据
```

---

不负责：

```text
开奖

结算

统计

页面生成
```

---

# 二、核心原则

系统采用：

```text
全年预测模式
```

---

禁止：

```text
开奖一期

生成一期预测
```

---

正确模式：

```text
创建玩法

↓

生成全年预测

↓

保存数据库

↓

等待开奖

↓

自动核对
```

---

# 三、生成时机

触发条件：

---

创建网站

```text
生成全部玩法全年数据
```

---

新增玩法

```text
生成该玩法全年数据
```

---

修改玩法

```text
重新生成全年数据
```

---

修改规则

```text
重新生成受影响玩法数据
```

---

管理员手动重建

```text
重新生成
```

---

AI命令触发

```text
重新生成
```

---

# 四、采种规则

支持：

```text
香港

澳门
```

---

数据独立：

```text
香港预测

澳门预测
```

---

禁止：

```text
混合生成
```

---

# 五、年度规则

每个采种：

```text
按年度生成
```

---

例如：

```text
2026
```

---

生成：

```text
2026001

2026002

...

2026366
```

---

最大：

```text
366期
```

---

实际生成数量：

香港：

```text
读取开奖日历
```

---

澳门：

```text
默认365/366期
```

---

# 六、生成对象

生成：

```text
prediction_record
```

---

例如：

```json
{
  "play":"平特一肖",

  "period":"2026001",

  "content":"马"
}
```

---

# 七、预测批次

所有生成记录：

```text
归属批次
```

---

表：

```sql
prediction_batch
```

---

结构：

```sql
id bigint

site_id bigint

lottery_type varchar(20)

year int

play_count int

record_count int

status varchar(20)

created_at timestamp
```

---

例如：

```text
2026

香港

180期

50玩法

9000条预测
```

---

# 八、预测记录表

表：

```sql
prediction_record
```

---

结构：

```sql
id bigint

batch_id bigint

site_id bigint

lottery_type varchar(20)

play_id bigint

year int

period varchar(20)

prediction_content text

status varchar(20)

created_at timestamp
```

---

状态：

```text
WAITING

HIT

MISS

HIDDEN

UPDATING
```

---

# 九、生成流程

标准流程：

```text
读取玩法

↓

读取规则

↓

读取属性

↓

生成全年期数

↓

生成预测

↓

保存数据库
```

---

# 十、AI生成模式

支持：

```text
AI生成
```

---

流程：

```text
玩法

↓

规则

↓

AI

↓

生成预测
```

---

例如：

```text
平特一肖
```

生成：

```text
鼠

马

龙

牛

...
```

---

全年生成。

---

# 十一、规则生成模式

支持：

```text
模板生成
```

---

例如：

```text
七肖中特
```

生成：

```text
鼠牛虎兔龙蛇马
```

---

保存：

```text
prediction_record
```

---

# 十二、随机生成模式

支持：

```text
随机生成
```

---

场景：

```text
测试环境

演示环境
```

---

禁止：

```text
生产环境默认使用
```

---

# 十三、历史重建

支持：

```text
根据历史开奖

重新生成数据
```

---

用于：

```text
老网站迁移

历史恢复

统计重建
```

---

# 十四、多期玩法生成

例如：

```text
三期三肖
```

---

生成：

```text
120期

121期

122期
```

属于：

```text
group_id=1
```

---

下一组：

```text
123期

124期

125期
```

属于：

```text
group_id=2
```

---

# 十五、绝杀玩法生成

例如：

```text
绝杀一肖
```

---

生成：

```text
鼠
```

---

含义：

```text
特码不会开鼠
```

---

保存方式：

```text
与普通玩法一致
```

---

# 十六、重新生成机制

支持：

```text
单玩法重建
```

---

支持：

```text
单采种重建
```

---

支持：

```text
整站重建
```

---

支持：

```text
整年重建
```

---

# 十七、版本管理

每次生成：

```text
生成新批次
```

---

旧批次：

```text
保留
```

---

允许：

```text
回滚
```

---

# 十八、性能要求

生成：

```text
50玩法
```

---

澳门：

```text
366期
```

---

总数据：

```text
18300条
```

---

要求：

```text
≤60秒
```

---

# 十九、缓存策略

生成完成：

```text
Redis缓存
```

---

缓存：

```text
玩法数据

统计数据

热门数据
```

---

# 二十、AI控制

AI允许：

```text
生成预测

重建预测

新增预测
```

---

AI禁止：

```text
修改开奖结果

修改结算结果

修改统计结果
```

---

# 二十一、后台控制

支持：

```text
生成全年数据
```

按钮。

---

支持：

```text
重新生成
```

按钮。

---

支持：

```text
批量重建
```

按钮。

---

# 二十二、接口

生成全年数据：

```http
POST /generator/year
```

---

重新生成玩法：

```http
POST /generator/play
```

---

重新生成站点：

```http
POST /generator/site
```

---

重建历史：

```http
POST /generator/rebuild
```

---

# 二十三、异常处理

生成失败：

```text
FAILED
```

---

记录：

```text
错误原因

错误时间
```

---

支持：

```text
继续生成

重新生成
```

---

# 二十四、开发冻结规则

```text
规则1：
全年预测一次生成

规则2：
开奖后只核对

规则3：
支持香港澳门

规则4：
支持批次管理

规则5：
支持历史重建

规则6：
支持AI生成

规则7：
支持多期玩法

规则8：
支持绝杀玩法

规则9：
支持版本回滚

规则10：
禁止开奖后生成预测
```

---

# 最终生成架构

```text
玩法规则

↓

属性规则

↓

Data Generator

↓

prediction_batch

↓

prediction_record

↓

等待开奖

↓

Settlement Engine

↓

Statistics Engine
```

---


