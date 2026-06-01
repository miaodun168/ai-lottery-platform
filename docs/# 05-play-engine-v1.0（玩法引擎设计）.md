# 05-play-engine-v2.0（玩法引擎设计-修正版）

## 文档状态

版本：v2.0

状态：规则冻结版

依赖：

* 01-domain-model-v1.4
* 06-result-engine-v1.0
* 07-attribute-engine-v1.0

---

# 一、模块目标

玩法引擎负责：

* 玩法定义
* 玩法生成
* 玩法预测
* 玩法判定
* 玩法结算
* 玩法统计
* 玩法展示
* AI玩法生成

---

# 二、全局业务规则

## 开奖结构

每期固定7个号码

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
01
13
22
35
41
46

49
```

其中：

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

# 三、玩法分类体系

## Category A

生肖玩法

预测目标：

```yaml
zodiac
```

例如：

```yaml
平特一肖

二肖中特

三肖中特

五肖中特

六肖中特

七肖中特

三期三肖

五期三肖
```

---

## Category B

号码玩法

预测目标：

```yaml
number
```

例如：

```yaml
平特一码

平特二码

平特三码

平特五码

七码
```

---

## Category C

属性玩法

预测目标：

```yaml
attribute
```

例如：

```yaml
大小中特

单双中特

红波中特

蓝波中特

绿波中特

五行中特

阴阳中特

左右中特

内外围中特

头数中特

尾数中特

合数中特
```

---

## Category D

组合玩法

预测目标：

```yaml
combination
```

例如：

```yaml
红波单

红波双

绿波大

蓝波小

马红波

阳肖红波

金木水火土组合
```

---

# 四、统一玩法结构

## PlayRule

```yaml
id:

name:

code:

category:

target_type:

scope:

period_count:

target_count:

hit_mode:

rule_expression:

status:
```

---

# 五、字段定义

## target_type

预测目标

```yaml
number

zodiac

attribute

combination
```

---

## scope

开奖范围

```yaml
all

special

normal
```

说明：

```yaml
all:
全部7个号码

normal:
仅前6个平码

special:
仅最后1个特码
```

---

## period_count

连续期数

```yaml
1

2

3

5

10
```

---

## target_count

预测数量

例如：

```yaml
1肖

2肖

3肖

5肖
```

---

## hit_mode

命中模式

```yaml
any

all
```

---

any

命中一个即中奖

---

all

全部命中才中奖

---

# 六、生肖玩法

## 平特一肖

预测：

```yaml
马
```

开奖结果：

```yaml
01
13
22
35
41
46
49
```

2026：

```yaml
马:
01
13
25
37
49
```

结果：

```yaml
中奖
```

---

判定：

```yaml
scope:
all

hit_mode:
any
```

即：

开奖结果7个号码中

存在预测生肖

即中奖

---

## 三肖中特

预测：

```yaml
马
龙
猴
```

结果：

```yaml
出现任意一个

中奖
```

---

## 五肖中特

预测：

```yaml
马
龙
猴
鸡
狗
```

同理。

---

# 七、多期玩法

## 三期三肖

预测：

```yaml
马
龙
猴
```

周期：

```yaml
3期
```

---

判定：

```yaml
未来连续3期

有一期命中

即中奖
```

---

配置：

```yaml
period_count:
3
```

---

## 五期三肖

```yaml
period_count:
5
```

---

# 八、号码玩法

## 平特一码

预测：

```yaml
25
```

开奖结果：

```yaml
01
13
25
35
41
46
49
```

结果：

```yaml
中奖
```

---

判定：

```yaml
scope:
all

hit_mode:
any
```

---

## 平特二码

预测：

```yaml
25
31
```

出现任意一个：

```yaml
中奖
```

---

## 七码

预测：

```yaml
01
13
25
31
36
44
49
```

---

命中模式：

```yaml
all
```

---

全部命中：

```yaml
中奖
```

---

# 九、属性玩法

## 大小中特

预测：

```yaml
大
```

---

判定：

```yaml
scope:
special
```

即：

只检查特码。

---

开奖结果：

```yaml
special:
49
```

属性：

```yaml
大
```

结果：

```yaml
中奖
```

---

## 单双中特

预测：

```yaml
双
```

---

只检查：

```yaml
特码
```

---

## 红波中特

预测：

```yaml
红波
```

---

只检查：

```yaml
特码波色
```

---

## 五行中特

预测：

```yaml
金
```

---

只检查：

```yaml
特码五行
```

---

## 阴阳中特

预测：

```yaml
阳肖
```

---

只检查：

```yaml
特码生肖属性
```

---

# 十、组合玩法

## 红波单

预测：

```yaml
红波单
```

---

开奖结果：

```yaml
特码:
45
```

属性：

```yaml
红波

单
```

---

结果：

```yaml
中奖
```

---

## 马红波

预测：

```yaml
马红波
```

---

要求：

```yaml
生肖=马

波色=红波
```

同时满足。

---

# 十一、玩法规则表达式

统一DSL：

## 平特一肖

```yaml
exists(
  zodiac in prediction
)
```

---

## 大小中特

```yaml
special.size
=
prediction
```

---

## 红波中特

```yaml
special.wave
=
prediction
```

---

## 三期三肖

```yaml
exists(
 issue[1..3]
)
```

---

# 十二、特殊业务规则

## 连错三期

需求：

```yaml
连续错3期
```

处理：

```yaml
隐藏历史数据

只显示当前预测
```

---

规则：

```yaml
miss_count >= 3
```

---

# 十三、统计引擎

统计：

```yaml
总期数

命中数

未中数

命中率

连续命中

连续未中

最大连中

最大连错
```

---

# 十四、AI玩法生成器

管理员：

```text
生成20个生肖玩法
```

AI生成：

```yaml
平特一肖

二肖中特

三肖中特

五肖中特

六肖中特

七肖中特

三期三肖

五期三肖

六合肖

三合肖
```

---

管理员：

```text
生成20个属性玩法
```

AI生成：

```yaml
大小中特

单双中特

红波中特

绿波中特

蓝波中特

五行中特

阴阳中特

左右中特

内外围中特

合数中特
```

---

# 十五、历史回填

首次建站：

```yaml
导入历史开奖
```

自动：

```yaml
生成预测

生成结算

生成统计

生成排行榜
```

---

# 十六、数据库表

```yaml
play_rule

play_category

prediction

prediction_item

prediction_settlement

statistics

ranking
```

---

# 十七、开发强制规则

规则1：

```yaml
前6个号码 = 平码
```

---

规则2：

```yaml
最后1个号码 = 特码
```

---

规则3：

属性玩法默认：

```yaml
scope:
special
```

只检查特码。

---

规则4：

生肖玩法默认：

```yaml
scope:
all
```

检查全部7个号码。

---

规则5：

所有玩法必须通过 Rule Engine 判定。

禁止写死逻辑。

---

# 十八、V1范围

必须实现：

* 生肖玩法
* 号码玩法
* 属性玩法
* 多期玩法
* 自动结算
* 历史回填
* 命中统计
* 连错三期规则
* AI玩法生成
