# 09-statistics-engine-v1.1（统计引擎完整版）

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

依赖文档

```text
00-global-business-rules-v1.1
05-play-engine-v2.0
06-result-engine-v2.0
08-settlement-engine-v1.1
15-database-schema-v1.0
19-play-rule-library-v1.0
```

---

# 一、引擎职责

Statistics Engine负责：

```text
命中率统计

趋势统计

排行榜统计

玩法统计

网站统计

采种统计

年度统计

连错统计

连中统计
```

---

不负责：

```text
生成预测

生成开奖结果

玩法结算

规则计算
```

---

# 二、核心原则

统计引擎必须遵守：

```text
全年预测一次生成

开奖后只核对

统计基于结算结果

禁止实时生成预测
```

---

数据来源：

```text
prediction_record

settlement_record
```

---

禁止：

```text
统计时重新计算玩法
```

---

# 三、统计流程

开奖录入后：

```text
开奖结果

↓

结算引擎

↓

生成结算结果

↓

统计引擎

↓

更新统计缓存

↓

前端展示
```

---

# 四、统计维度

系统支持：

```text
采种统计

网站统计

玩法统计

模板统计

年度统计

全局统计
```

---

# 五、采种统计

支持：

```text
香港

澳门
```

---

必须独立统计：

```text
香港统计

澳门统计
```

---

禁止：

```text
混合统计
```

---

例如：

```text
香港命中率
```

不能包含：

```text
澳门数据
```

---

# 六、玩法统计

每个玩法维护：

```text
总预测数

总命中数

总错误数

命中率
```

---

示例：

```text
平特一肖
```

统计：

```json
{
  "total":366,
  "hit":228,
  "miss":138,
  "hit_rate":62.30
}
```

---

# 七、命中率公式

计算：

```text
命中数 ÷ 已开奖总数 × 100
```

---

例如：

```text
已开奖

100期
```

---

结果：

```text
命中

63期
```

---

命中率：

```text
63%
```

---

保留：

```text
两位小数
```

---

# 八、总命中率

统计范围：

```text
当前玩法

全部已开奖期数
```

---

例如：

```text
2026年

已开奖

180期
```

---

结果：

```text
总命中率
```

---

# 九、近10期统计

统计：

```text
最近10个已开奖期数
```

---

例如：

```text
2026171

~

2026180
```

---

输出：

```json
{
  "hit":7,
  "miss":3,
  "rate":70
}
```

---

# 十、近30期统计

统计：

```text
最近30个已开奖期数
```

---

输出：

```json
{
  "hit":19,
  "miss":11,
  "rate":63.33
}
```

---

# 十一、近100期统计

统计：

```text
最近100个已开奖期数
```

---

输出：

```json
{
  "hit":61,
  "miss":39,
  "rate":61
}
```

---

# 十二、年度统计

统计范围：

```text
年度
```

例如：

```text
2026
```

---

统计：

```text
全年命中

全年错误

全年命中率
```

---

输出：

```json
{
  "year":2026,
  "hit":215,
  "miss":151,
  "rate":58.74
}
```

---

# 十三、连中统计

统计：

```text
连续命中次数
```

---

例如：

```text
HIT

HIT

HIT

HIT
```

---

结果：

```text
连中4期
```

---

维护：

```text
当前连中

历史最高连中
```

---

# 十四、连错统计

统计：

```text
连续错误次数
```

---

例如：

```text
MISS

MISS

MISS
```

---

结果：

```text
连错3期
```

---

维护：

```text
当前连错

历史最高连错
```

---

# 十五、隐藏规则统计

触发：

```text
连续错误 >= 3
```

---

系统记录：

```text
隐藏开始期

隐藏结束期

隐藏次数
```

---

输出：

```json
{
  "hidden_count":8
}
```

---

# 十六、更新中统计

如果开启：

```text
show_updating=true
```

---

统计：

```text
更新中次数
```

---

注意：

```text
UPDATING状态
```

不能参与：

```text
命中统计

错误统计
```

---

# 十七、多期玩法统计

例如：

```text
三期三肖
```

---

规则：

```text
3期为一组
```

---

统计单位：

```text
组
```

不是：

```text
单期
```

---

例如：

```text
120期

121期

122期
```

组成：

```text
第一组
```

---

结果：

```text
命中
```

---

统计：

```json
{
  "group_total":100,
  "group_hit":65,
  "group_rate":65
}
```

---

# 十八、绝杀玩法统计

例如：

```text
绝杀一肖
```

---

规则：

```text
未开预测生肖

即命中
```

---

统计方式：

```text
与普通玩法一致
```

---

# 十九、排行榜统计

支持：

```text
总榜

近10期榜

近30期榜

近100期榜
```

---

排序：

```text
命中率 DESC
```

---

示例：

```json
[
  {
    "play":"平特一肖",
    "rate":68
  },
  {
    "play":"三期三肖",
    "rate":65
  }
]
```

---

# 二十、热门玩法统计

统计：

```text
浏览量

点击量

访问量
```

---

输出：

```json
{
  "play":"平特一肖",
  "views":12888
}
```

---

# 二十一、网站统计

统计：

```text
网站总访问量

今日访问量

昨日访问量

UV

PV
```

---

支持：

```text
按站点统计
```

---

# 二十二、首页展示统计

玩法卡片显示：

```text
总命中率

近10期

近30期

近100期
```

---

示例：

```text
总命中率

63.52%
```

---

```text
近10期

7中3
```

---

```text
近30期

19中11
```

---

```text
近100期

61中39
```

---

# 二十三、统计缓存

必须缓存：

```text
排行榜

热门玩法

近100期统计
```

---

推荐：

```text
Redis
```

---

刷新：

```text
开奖后自动刷新
```

---

# 二十四、统计数据库表

## statistics_summary

```sql
id bigint

site_id bigint

lottery_type varchar(20)

play_id bigint

year int

total_count int

hit_count int

miss_count int

hit_rate decimal(8,2)

current_hit_streak int

current_miss_streak int

best_hit_streak int

best_miss_streak int

hidden_count int

updating_count int

updated_at timestamp
```

---

## statistics_period

```sql
id bigint

site_id bigint

lottery_type varchar(20)

play_id bigint

period_type varchar(20)

hit_count int

miss_count int

hit_rate decimal(8,2)

updated_at timestamp
```

---

period_type：

```text
last_10

last_30

last_100
```

---

# 二十五、接口输出格式

标准格式：

```json
{
  "play_id":1,

  "total_rate":63.25,

  "last_10_rate":70,

  "last_30_rate":63.33,

  "last_100_rate":61,

  "current_hit_streak":3,

  "current_miss_streak":0
}
```

---

# 二十六、性能要求

统计查询：

```text
≤100ms
```

---

排行榜：

```text
≤200ms
```

---

首页：

```text
≤500ms
```

---

# 二十七、AI限制

AI禁止：

```text
修改统计结果
```

---

AI禁止：

```text
手工调整命中率
```

---

AI只能：

```text
查询统计

生成统计页面

生成统计模块
```

---

# 二十八、开发冻结规则

```text
规则1：
统计来源必须为结算结果

规则2：
全年预测一次生成

规则3：
开奖后只核对

规则4：
香港澳门独立统计

规则5：
支持多期玩法统计

规则6：
支持绝杀玩法统计

规则7：
支持隐藏规则统计

规则8：
支持更新中规则统计

规则9：
支持排行榜

规则10：
支持缓存
```

---

# 最终统计架构

```text
prediction_record

↓

settlement_record

↓

statistics_engine

↓

statistics_summary

↓

redis_cache

↓

frontend
```

---
 
