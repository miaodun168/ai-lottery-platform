这个文档是整个系统最核心的文档之一。

因为：

```text
05-play-engine
08-settlement-engine
12-data-generator
18-play-dsl-spec
```

全部依赖它。

你前面发的30条规则已经足够让我定义出标准规则库结构。

---

# 19-play-rule-library-v1.1（玩法规则库完整版）

## 文档状态

```text
版本：v1.1
状态：冻结版
优先级：P0
```

---

# 一、规则库目标

统一管理所有玩法规则。

系统任何玩法：

```text
生成预测

结算

统计

AI理解

网站展示
```

全部通过规则库驱动。

---

# 二、标准规则结构

每条规则：

```json
{
  "rule_code":"20001",

  "rule_name":"平特一肖",

  "version":"v1.0",

  "predict_type":"attr_1",

  "target_scope":"pt",

  "hit_mode":"include",

  "select_count":1,

  "group_size":1
}
```

---

# 三、字段定义

| 字段           | 说明   |
| ------------ | ---- |
| rule_code    | 规则编号 |
| rule_name    | 玩法名称 |
| predict_type | 预测类型 |
| target_scope | 开奖范围 |
| hit_mode     | 命中方式 |
| select_count | 预测数量 |
| group_size   | 组期数  |

---

# 四、预测类型

## number

号码

```text
01~49
```

---

## number_1

头数

```text
0
1
2
3
4
```

---

## number_2

尾数

```text
0~9
```

---

## attr_1

生肖

```text
鼠牛虎兔龙蛇马羊猴鸡狗猪
```

---

## attr_2

五行

```text
金木水火土
```

---

## attr_3

波色

```text
红波
绿波
蓝波
```

---

## attr_5

分类属性

```text
阴阳
前后
家禽野兽
文武
三国家族
天地
左右
```

---

## attr_6

单双

```text
单
双
```

---

## attr_7

大小

```text
小
大
```

---

## attr_8

合数单双

```text
合单
合双
```

---

## attr_9

五段

```text
第一段
第二段
第三段
第四段
第五段
```

---

## attr_11

组合属性

```text
红单
红双
绿单
绿双
蓝单
蓝双

01合~14合
```

---

# 五、开奖范围

## pt

七码

```text
平码+特码

共7个号码
```

---

## t

特码

```text
最后1个号码
```

---

## p

平码

```text
前6个号码
```

---

# 六、命中模式

## include

包含即中

例如：

```text
平特一肖
```

预测：

```text
马
```

开奖：

```text
兔
牛
蛇
马
鸡
狗
猪
```

结果：

```text
命中
```

---

## exclude

排除即中

例如：

```text
绝杀一肖
```

预测：

```text
马
```

特码：

```text
牛
```

结果：

```text
命中
```

---

# 七、标准规则表

## 20001 平特一肖

```json
{
  "rule_code":"20001",
  "rule_name":"平特一肖",
  "predict_type":"attr_1",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
}
```

---

## 20002 平特一尾

```json
{
  "rule_code":"20002",
  "rule_name":"平特一尾",
  "predict_type":"number_2",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":1
}
```

---

## 20003 二波中特

```json
{
  "rule_code":"20003",
  "rule_name":"二波中特",
  "predict_type":"attr_3",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":2
}
```

---

## 20004 绝杀五码

```json
{
  "rule_code":"20004",
  "rule_name":"绝杀五码",
  "predict_type":"number",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":5
}
```

---

## 20005 单双中特

```json
{
  "rule_code":"20005",
  "rule_name":"单双中特",
  "predict_type":"attr_6",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1
}
```

---

## 20006 大小中特

修正为：

```text
01~24 = 小

25~49 = 大
```

```json
{
  "rule_code":"20006",
  "rule_name":"大小中特",
  "predict_type":"attr_7",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1
}
```

---

## 20007 绝杀二尾

```json
{
  "rule_code":"20007",
  "rule_name":"绝杀二尾",
  "predict_type":"number_2",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":2
}
```

---

## 20008 绝杀一头

```json
{
  "rule_code":"20008",
  "rule_name":"绝杀一头",
  "predict_type":"number_1",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":1
}
```

---

## 20009 绝杀二行

```json
{
  "rule_code":"20009",
  "rule_name":"绝杀二行",
  "predict_type":"attr_2",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":2
}
```

---

## 20010 绝杀一肖

```json
{
  "rule_code":"20010",
  "rule_name":"绝杀一肖",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":1
}
```

---

## 20014 七肖中特

```json
{
  "rule_code":"20014",
  "rule_name":"七肖中特",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":7
}
```

---

## 20020 绝杀三肖

```json
{
  "rule_code":"20020",
  "rule_name":"绝杀三肖",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":3
}
```

---

## 20021 九肖中特

```json
{
  "rule_code":"20021",
  "rule_name":"九肖中特",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":9
}
```

---

## 20027 三行中特

```json
{
  "rule_code":"20027",
  "rule_name":"三行中特",
  "predict_type":"attr_2",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":3
}
```

---

## 20028 六肖中特

```json
{
  "rule_code":"20028",
  "rule_name":"六肖中特",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":6
}
```

---

## 20029 平特六肖

```json
{
  "rule_code":"20029",
  "rule_name":"平特六肖",
  "predict_type":"attr_1",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":6
}
```

---

# 八、多期玩法标准

## 三期三肖

```json
{
  "rule_code":"30001",
  "rule_name":"三期三肖",

  "predict_type":"attr_1",

  "target_scope":"pt",

  "hit_mode":"include",

  "select_count":3,

  "group_size":3
}
```

规则：

```text
连续3期为1组

任意一期命中

整组命中
```

---

## 三期六码

```json
{
  "rule_code":"30002",
  "group_size":3,
  "select_count":6
}
```

---

## 五期五肖

```json
{
  "rule_code":"30003",
  "group_size":5,
  "select_count":5
}
```

---

# 九、DSL映射标准

DSL格式：

```text
rule_code,
predict_type,
target_scope,
hit_mode,
select_count,
group_size
```

---

例如：

```text
20001,
attr_1,
pt,
include,
1,
1
```

---

# 十、AI理解标准

AI新增玩法时必须符合：

```text
predict_type

target_scope

hit_mode

select_count

group_size
```

五要素。

---

例如：

```text
五肖连中
```

AI自动转换：

```json
{
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":5
}
```

---

# 十一、玩法分类

## 平特玩法

```text
平特一肖
平特一尾
平特六肖
```

---

## 特码玩法

```text
大小中特
单双中特
二波中特
七肖中特
```

---

## 绝杀玩法

```text
绝杀一肖
绝杀三码
绝杀二尾
绝杀二行
```

---

## 多期玩法

```text
三期三肖
三期六码
五期五肖
```

---

# 十二、冻结规则

```text
规则1：
前6个号码=平码

规则2：
最后1个号码=特码

规则3：
pt=7个号码

规则4：
t=特码

规则5：
p=平码

规则6：
include=命中

规则7：
exclude=绝杀

规则8：
支持group玩法

规则9：
支持DSL驱动

规则10：
支持AI自动扩展玩法
```

---

