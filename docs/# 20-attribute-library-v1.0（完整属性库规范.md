# 20-attribute-library-v1.0（完整属性库规范）

## 文档状态

版本：

```text
v1.0
```

状态：

```text
核心业务冻结版
```

优先级：

```text
P0
```

依赖：

```text
00-global-business-rules-v1.0

07-attribute-engine-v1.0

18-play-dsl-spec-v1.0

19-play-rule-library-v1.0
```

---

# 一、文档目标

统一管理系统所有属性。

包括：

```text
动态属性

固定属性

年份变化属性

扩展属性
```

作为：

```text
Attribute Engine

Play Engine

Settlement Engine

Statistics Engine

AI Generator
```

统一数据源。

---

# 二、属性分类

系统属性分为：

```text
A.动态属性

生肖
五行

B.固定号码属性

波色
单双
大小
合数
头尾
左右
内外围

C.固定生肖属性

阴阳肖
前后肖
文武肖
家禽野兽

D.扩展生肖属性

三合
四季
琴棋书画
男女肖
天地肖

E.自定义属性

后台新增
AI新增
```

---

# 三、动态属性

## 生肖属性

类型：

```yaml
attribute_type: zodiac
dynamic: true
```

---

业务规则：

```text
每年生肖号码变化
```

例如：

### 2026马年

```text
马
01
13
25
37
49
```

---

其余生肖：

```text
每12个号码循环一次
```

---

数据库

```sql
attribute_zodiac_year
```

字段：

```sql
id

year

zodiac

number
```

示例：

```text
2026 马 01
2026 马 13
2026 马 25
2026 马 37
2026 马 49
```

---

## 五行属性

类型：

```yaml
attribute_type: wuxing
dynamic: true
```

---

业务规则：

```text
五行每年变化

依据：

天干地支

60甲子
```

---

数据库：

```sql
attribute_wuxing_year
```

字段：

```sql
year

number

wuxing
```

---

# 四、固定号码属性

---

## 波色

属性编码：

```yaml
wave
```

---

### 红波

```text
01
02
07
08
12
13
18
19
23
24
29
30
34
35
40
45
46
```

---

### 蓝波

```text
03
04
09
10
14
15
20
25
26
31
36
37
41
42
47
48
```

---

### 绿波

```text
05
06
11
16
17
21
22
27
28
32
33
38
39
43
44
49
```

---

数据库：

```sql
attribute_wave
```

---

## 单双

属性编码：

```yaml
odd_even
```

---

单

```text
1
3
5
7
9
...
49
```

---

双

```text
2
4
6
8
...
48
```

---

## 大小

属性编码：

```yaml
size
```

---

业务规则：

```text
01-24 = 小

25-49 = 大
```

---

注意：

此规则固定为项目标准。

不得修改。

---

## 头数

属性编码：

```yaml
head
```

---

0头

```text
01-09
```

---

1头

```text
10-19
```

---

2头

```text
20-29
```

---

3头

```text
30-39
```

---

4头

```text
40-49
```

---

## 尾数

属性编码：

```yaml
tail
```

---

0尾

```text
10
20
30
40
```

---

1尾

```text
01
11
21
31
41
```

---

...

---

9尾

```text
09
19
29
39
49
```

---

## 左右

属性编码：

```yaml
left_right
```

---

左边

```text
1,2,3,4,8,9,10,11,15,16,17,18,
22,23,24,29,30,31,36,37,38,
43,44,45
```

---

右边

```text
5,6,7,12,13,14,19,20,21,
25,26,27,28,32,33,34,35,
39,40,41,42,46,47,48,49
```

---

## 合数大小

属性编码：

```yaml
sum_size
```

---

合数小

```text
01,10,02,11,20,03,12,21,30,
04,13,22,31,40,05,14,23,
32,41,06,15,24,33,42
```

---

合数大

```text
07,16,25,34,43,
08,17,26,35,44,
09,18,27,36,45,
19,28,37,46,
29,38,47,
39,48,49
```

---

## 内外围

属性编码：

```yaml
inside_outside
```

---

内围

```text
09,10,11,12,13,
16,17,18,19,20,
23,24,25,26,27,
30,31,32,33,34,
37,38,39,40,41
```

---

外围

```text
01,02,03,04,05,06,07,08,
14,15,
21,22,
28,29,
35,36,
42,43,44,45,46,47,48,49
```

---

# 五、固定生肖属性

---

## 家禽野兽

属性编码：

```yaml
livestock_wild
```

---

家禽

```text
牛
马
羊
鸡
猪
狗
```

---

野兽

```text
鼠
虎
兔
龙
蛇
猴
```

---

## 文武肖

属性编码：

```yaml
civil_military
```

---

文肖

```text
鼠
兔
龙
羊
鸡
猪
```

---

武肖

```text
牛
虎
蛇
马
猴
狗
```

---

## 前后肖

属性编码：

```yaml
front_back
```

---

前肖

```text
鼠
牛
虎
兔
龙
蛇
```

---

后肖

```text
马
羊
猴
鸡
狗
猪
```

---

## 阴阳肖

属性编码：

```yaml
yin_yang_zodiac
```

---

阴肖

```text
鼠
龙
马
蛇
狗
猪
```

---

阳肖

```text
鸡
兔
牛
羊
虎
猴
```

---

# 六、扩展生肖属性

---

## 三合生肖

属性编码：

```yaml
three_harmony
```

---

鼠龙猴

```text
水局
```

---

牛蛇鸡

```text
金局
```

---

虎马狗

```text
火局
```

---

兔羊猪

```text
木局
```

---

---

## 琴棋书画

属性编码：

```yaml
art_group
```

---

琴

```text
鼠
牛
兔
蛇
```

---

棋

```text
虎
龙
马
羊
```

---

书

```text
猴
鸡
狗
```

---

画

```text
猪
```

---

（后续允许后台修改）

---

## 四季生肖

属性编码：

```yaml
season_zodiac
```

---

春

```text
虎
兔
龙
```

---

夏

```text
蛇
马
羊
```

---

秋

```text
猴
鸡
狗
```

---

冬

```text
猪
鼠
牛
```

---

# 七、组合属性

---

## 红单

规则：

```yaml
wave: 红
odd_even: 单
```

---

## 红双

规则：

```yaml
wave: 红
odd_even: 双
```

---

## 蓝单

规则：

```yaml
wave: 蓝
odd_even: 单
```

---

## 蓝双

规则：

```yaml
wave: 蓝
odd_even: 双
```

---

## 绿单

规则：

```yaml
wave: 绿
odd_even: 单
```

---

## 绿双

规则：

```yaml
wave: 绿
odd_even: 双
```

---

数据库：

```sql
attribute_composite
```

---

# 八、属性数据库设计

## attribute_group

```sql
id bigint

code varchar(50)

name varchar(100)

dynamic boolean

enabled boolean
```

---

## attribute_item

```sql
id bigint

group_id bigint

code varchar(50)

name varchar(100)

sort int
```

---

## attribute_mapping

```sql
id bigint

group_code varchar(50)

item_code varchar(50)

value varchar(50)
```

---

支持：

```text
号码映射

生肖映射

组合映射
```

---

# 九、AI扩展规范

AI允许新增：

```text
属性组

属性项

映射规则
```

---

例如：

```text
新增属性：

东西南北
```

AI生成：

```yaml
group:
direction

items:
东
西
南
北
```

---

自动写入：

```sql
attribute_group

attribute_item

attribute_mapping
```

---

# 十、后台扩展规范

管理员可以：

```text
新增属性组

修改属性组

删除属性组

启用属性组

停用属性组
```

---

无需修改代码。

---

# 十一、开发冻结规则

```text
规则1：
所有玩法必须引用属性库

规则2：
禁止代码写死属性

规则3：
生肖和五行必须支持年份切换

规则4：
所有属性支持后台管理

规则5：
所有属性支持AI新增

规则6：
属性修改实时生效

规则7：
属性库独立于玩法库

规则8：
玩法库只能引用属性库
```

---

# 十二、Attribute Engine输出标准

统一输出：

```json
{
  "number": 25,
  "zodiac": "马",
  "wave": "蓝",
  "wuxing": "金",
  "size": "大",
  "odd_even": "单",
  "head": "2头",
  "tail": "5尾",
  "left_right": "右",
  "inside_outside": "内",
  "sum_size": "合数大"
}
```

---

# 文档结论

本规范确定：

```text
属性 ≠ 写死代码

属性 = 数据库配置
```

最终形成：

```text
Attribute Library

↓

Attribute Engine

↓

Play Engine

↓

Settlement Engine

↓

Statistics Engine

↓

AI Generator
```


