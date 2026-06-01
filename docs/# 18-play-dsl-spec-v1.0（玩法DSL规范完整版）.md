# 18-play-dsl-spec-v1.0（玩法DSL规范完整版）

## 文档状态

版本：v1.0

状态：冻结版

优先级：

```text
P0（核心）
```

依赖：

```text
00-global-business-rules-v1.0

05-play-engine-v2.0

07-attribute-engine-v1.0

08-settlement-engine-v1.0

11-rule-engine-v1.0
```

---

# 一、文档目标

本规范定义：

```text
玩法描述语言（Play DSL）
```

用于统一描述：

```text
玩法

规则

命中条件

结算条件

统计条件

展示条件
```

最终实现：

```text
一个DSL

↓

自动生成玩法

↓

自动生成规则

↓

自动生成结算逻辑

↓

自动生成统计逻辑
```

---

# 二、为什么需要DSL

例如：

```text
平特一肖

七肖中特

绝杀三肖

单双中特

三行中特
```

本质上只是：

```text
预测对象不同

命中范围不同

命中方式不同

预测数量不同
```

所以不应该写：

```text
1000个玩法

1000套代码
```

而应该：

```text
1套DSL

1000个配置
```

---

# 三、DSL结构

标准格式：

```yaml
version:

target:

scope:

mode:

count:

group:

settlement:

statistics:

display:
```

---

# 四、字段定义

## version

规则版本

```yaml
version: v1
```

---

## target

预测目标

```yaml
zodiac
number
tail
head
wave
wuxing
size
odd_even
attribute
```

---

## scope

命中范围

```yaml
special
```

对应：

```text
特码
```

---

```yaml
normal
```

对应：

```text
平码
```

---

```yaml
all
```

对应：

```text
平码+特码
```

---

## mode

命中模式

```yaml
include
```

命中

---

```yaml
exclude
```

绝杀

---

```yaml
group_include
```

组选

---

## count

预测数量

例如：

```yaml
count: 1
```

---

```yaml
count: 3
```

---

```yaml
count: 7
```

---

## group

期数规则

```yaml
group: 1
```

单期

---

```yaml
group: 3
```

三期

---

```yaml
group: 5
```

五期

---

## settlement

结算方式

```yaml
single_hit
```

命中即中

---

```yaml
all_hit
```

全中

---

```yaml
any_hit
```

任意中

---

## statistics

统计方式

```yaml
normal
```

普通统计

---

```yaml
group
```

多期统计

---

## display

展示模式

```yaml
normal
```

普通展示

---

```yaml
hide_after_3_miss
```

连错三期隐藏

---

# 五、Target标准库

## zodiac

生肖

```yaml
target: zodiac
```

---

## number

号码

```yaml
target: number
```

---

## tail

尾数

```yaml
target: tail
```

---

## head

头数

```yaml
target: head
```

---

## wave

波色

```yaml
target: wave
```

---

## wuxing

五行

```yaml
target: wuxing
```

---

## odd_even

单双

```yaml
target: odd_even
```

---

## size

大小

```yaml
target: size
```

---

## attribute

属性组

例如：

```text
阴阳

天地

家禽野兽

前后肖

文武肖

三合
```

统一：

```yaml
target: attribute
```

---

# 六、Scope标准库

## special

特码

```yaml
scope: special
```

对应：

```text
最后一个号码
```

---

## normal

平码

```yaml
scope: normal
```

对应：

```text
前6个号码
```

---

## all

全号

```yaml
scope: all
```

对应：

```text
7个号码
```

---

# 七、Mode标准库

## include

包含命中

例如：

```text
七肖中特
```

---

规则：

```text
特码生肖在预测生肖里面
```

---

## exclude

绝杀

例如：

```text
绝杀三肖
```

---

规则：

```text
特码生肖不在预测生肖里面
```

---

## exact

全中

例如：

```text
三中三
```

---

规则：

```text
全部命中
```

---

# 八、玩法生成规则

## 例1：平特一肖

DSL：

```yaml
version: v1

target: zodiac

scope: all

mode: include

count: 1

group: 1

settlement: single_hit
```

生成：

```text
平特一肖
```

---

命中规则：

```text
7个号码中出现预测生肖即中
```

---

## 例2：七肖中特

DSL：

```yaml
target: zodiac

scope: special

mode: include

count: 7
```

生成：

```text
七肖中特
```

---

规则：

```text
特码生肖在7个生肖内
```

---

## 例3：绝杀三肖

DSL：

```yaml
target: zodiac

scope: special

mode: exclude

count: 3
```

生成：

```text
绝杀三肖
```

---

规则：

```text
特码生肖不在3个生肖中
```

---

## 例4：大小中特

DSL：

```yaml
target: size

scope: special

mode: include

count: 1
```

生成：

```text
大小中特
```

---

规则：

```text
预测大或小

特码属于预测范围
```

---

## 例5：单双中特

DSL：

```yaml
target: odd_even

scope: special

mode: include

count: 1
```

生成：

```text
单双中特
```

---

# 九、多期玩法DSL

## 三期三肖

DSL：

```yaml
target: zodiac

scope: all

mode: include

count: 3

group: 3

settlement: any_hit
```

---

规则：

```text
连续3期

任意一期命中

即中
```

---

## 五期三肖

DSL：

```yaml
target: zodiac

scope: all

mode: include

count: 3

group: 5

settlement: any_hit
```

---

# 十、组合玩法DSL

例如：

```text
九肖12码
```

---

DSL：

```yaml
components:

- zodiac:
    count: 9

- number:
    count: 12
```

---

组合规则：

```text
多个子规则同时存在
```

---

# 十一、属性玩法DSL

## 家禽野兽

DSL：

```yaml
target: attribute

attribute_group: livestock_wild

scope: special

mode: include

count: 1
```

---

## 阴阳肖

DSL：

```yaml
target: attribute

attribute_group: yin_yang

scope: special

mode: include
```

---

## 文武肖

DSL：

```yaml
target: attribute

attribute_group: civil_military
```

---

# 十二、结算映射

DSL：

```yaml
mode: include
```

---

自动映射：

```text
Settlement Engine

ContainsMatchRule
```

---

DSL：

```yaml
mode: exclude
```

---

自动映射：

```text
ExcludeMatchRule
```

---

DSL：

```yaml
group: 3
```

---

自动映射：

```text
MultiPeriodSettlementRule
```

---

# 十三、统计映射

普通玩法：

```yaml
statistics: normal
```

---

统计：

```text
总命中率

近10期

近30期

近100期
```

---

多期玩法：

```yaml
statistics: group
```

---

统计：

```text
按组统计
```

---

# 十四、数据库存储格式

## play_rule_library

新增字段：

```json
{
  "dsl": {
    "target": "zodiac",
    "scope": "special",
    "mode": "include",
    "count": 7
  }
}
```

---

# 十五、AI玩法生成规范

AI输入：

```text
新增玩法

特码预测5个生肖

中一个算中
```

---

AI生成：

```yaml
target: zodiac

scope: special

mode: include

count: 5

settlement: single_hit
```

---

自动创建：

```text
五肖中特
```

---

# 十六、AI新增玩法规范

支持：

```text
新增玩法

修改玩法

复制玩法

组合玩法
```

---

AI只允许：

```text
生成DSL

禁止直接写代码
```

---

# 十七、开发冻结规则

规则1

```yaml
所有玩法必须DSL化
```

---

规则2

```yaml
禁止硬编码玩法
```

---

规则3

```yaml
新增玩法必须生成DSL
```

---

规则4

```yaml
结算引擎只识别DSL
```

---

规则5

```yaml
统计引擎只识别DSL
```

---

规则6

```yaml
AI生成玩法必须输出DSL
```

---

# 十八、Claude Code开发要求

必须先实现：

```text
PlayDSLParser
```

---

然后：

```text
PlayGenerator
```

---

然后：

```text
SettlementMapper
```

---

然后：

```text
StatisticsMapper
```

---

最后：

```text
AIPlayGenerator
```

---

# 文档结论

本规范确定：

```text
玩法 ≠ 代码

玩法 = DSL配置
```

最终实现：

```text
玩法库

↓

DSL

↓

Play Engine

↓

Settlement Engine

↓

Statistics Engine

↓

自动生成
```

这份文档是整个项目玩法系统的最高规范，后续所有玩法规则库（19-play-rule-library-v1.0）必须基于本DSL标准定义。
