这个文档不是玩法说明书，而是：

```text
play_rule 表初始化数据
```

给数据库 Seeder 和 Claude Code 直接导入使用。

---

# 28-play-rule-seed-data-v1.0

## 文档状态

```text
版本：v1.0
状态：冻结版
用途：play_rule Seeder
```

---

# 一、字段规范

```json
{
  "rule_code":"20001",
  "rule_name":"平特一肖",
  "predict_type":"attr_1",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1,
  "version":"v1.0"
}
```

---

# 二、命中模式

## include

包含即中

```text
预测范围包含开奖结果
```

---

## exclude

排除即中

```text
开奖结果不在预测范围
```

---

# 三、开奖范围

## pt

```text
7个号码

平码+特码
```

---

## p

```text
前6个号码

平码
```

---

## t

```text
最后1个号码

特码
```

---

# 四、基础规则库

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
  "select_count":1,
  "group_size":1
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
  "select_count":2,
  "group_size":1
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
  "select_count":5,
  "group_size":1
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
  "select_count":1,
  "group_size":1
}
```

---

## 20006 大小中特

```json
{
  "rule_code":"20006",
  "rule_name":"大小中特",
  "predict_type":"attr_7",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
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
  "select_count":2,
  "group_size":1
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
  "select_count":1,
  "group_size":1
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
  "select_count":2,
  "group_size":1
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
  "select_count":1,
  "group_size":1
}
```

---

## 20011 绝杀二个半波

```json
{
  "rule_code":"20011",
  "rule_name":"绝杀二个半波",
  "predict_type":"attr_11",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":1,
  "group_size":1
}
```

候选值：

```text
红单
红双
绿单
绿双
蓝单
蓝双
```

---

## 20012 绝杀二段

```json
{
  "rule_code":"20012",
  "rule_name":"绝杀二段",
  "predict_type":"attr_9",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":2,
  "group_size":1
}
```

---

## 20013 绝杀二合

```json
{
  "rule_code":"20013",
  "rule_name":"绝杀二合",
  "predict_type":"attr_11",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":2,
  "group_size":1
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
  "select_count":7,
  "group_size":1
}
```

---

## 20015 七尾中特

```json
{
  "rule_code":"20015",
  "rule_name":"七尾中特",
  "predict_type":"number_2",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":7,
  "group_size":1
}
```

---

## 20016 家禽野兽

```json
{
  "rule_code":"20016",
  "rule_name":"家禽野兽",
  "predict_type":"attr_5",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
}
```

---

## 20017 文肖武肖

```json
{
  "rule_code":"20017",
  "rule_name":"文肖武肖",
  "predict_type":"attr_5",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
}
```

---

## 20018 前肖后肖

```json
{
  "rule_code":"20018",
  "rule_name":"前肖后肖",
  "predict_type":"attr_5",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
}
```

---

## 20019 阴肖阳肖

```json
{
  "rule_code":"20019",
  "rule_name":"阴肖阳肖",
  "predict_type":"attr_5",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
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
  "select_count":3,
  "group_size":1
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
  "select_count":9,
  "group_size":1
}
```

---

## 20022 绝杀二肖

```json
{
  "rule_code":"20022",
  "rule_name":"绝杀二肖",
  "predict_type":"attr_1",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":2,
  "group_size":1
}
```

---

## 20023 三头中特

```json
{
  "rule_code":"20023",
  "rule_name":"三头中特",
  "predict_type":"number_1",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":3,
  "group_size":1
}
```

---

## 20024 绝杀五尾

```json
{
  "rule_code":"20024",
  "rule_name":"绝杀五尾",
  "predict_type":"number_2",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":5,
  "group_size":1
}
```

---

## 20025 绝杀三尾

```json
{
  "rule_code":"20025",
  "rule_name":"绝杀三尾",
  "predict_type":"number_2",
  "target_scope":"t",
  "hit_mode":"exclude",
  "select_count":3,
  "group_size":1
}
```

---

## 20026 三国选一

```json
{
  "rule_code":"20026",
  "rule_name":"三国选一",
  "predict_type":"attr_5",
  "target_scope":"t",
  "hit_mode":"include",
  "select_count":1,
  "group_size":1
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
  "select_count":3,
  "group_size":1
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
  "select_count":6,
  "group_size":1
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
  "select_count":6,
  "group_size":1
}
```

---

# 五、多期玩法规则

## 30001 三期三肖

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

---

## 30002 三期六码

```json
{
  "rule_code":"30002",
  "rule_name":"三期六码",
  "predict_type":"number",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":6,
  "group_size":3
}
```

---

## 30003 五期五肖

```json
{
  "rule_code":"30003",
  "rule_name":"五期五肖",
  "predict_type":"attr_1",
  "target_scope":"pt",
  "hit_mode":"include",
  "select_count":5,
  "group_size":5
}
```

---

# 六、Seeder导入顺序

```text
1~19999
系统保留

20001~
普通玩法

30001~
多期玩法

90000~
未来扩展玩法
```

---

# 七、冻结规则

```text
规则编号永久唯一

不允许修改历史规则编号

允许新增规则

不允许删除已上线规则

玩法全部通过DSL驱动

AI新增玩法必须写入play_rule表

所有玩法必须绑定rule_code
```

这份文档配合：

```text
19-play-rule-library-v1.1
18-play-dsl-spec-v1.0
```

就可以直接生成：

```sql
play_rule
```

初始化数据以及 Seeder 文件。

