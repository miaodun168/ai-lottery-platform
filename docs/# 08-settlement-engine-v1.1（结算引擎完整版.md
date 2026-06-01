下面是根据你最新业务规则修正后的版本，重点修复：

✅ 全年预测一次性生成
✅ 开奖后只核对不生成预测
✅ 香港/澳门双采种
✅ 连错三期隐藏规则
✅ 更新中规则
✅ 多期玩法结算规则
✅ 统计数据更新规则
✅ AI不参与日常开奖结算

---

# 08-settlement-engine-v1.1（结算引擎完整版）

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
05-play-engine-v2.0

06-result-engine-v2.0

07-attribute-engine-v1.0

09-statistics-engine-v1.0

19-play-rule-library-v1.0

00-global-business-rules-v1.1
```

---

# 一、引擎职责

Settlement Engine负责：

```text
开奖核对

玩法结算

命中判定

统计更新

连错统计

隐藏规则处理

更新中规则处理
```

---

不负责：

```text
生成预测

生成玩法

生成开奖
```

---

# 二、核心原则

系统采用：

```text
全年预测模式
```

---

流程：

```text
创建玩法

↓

生成全年预测

↓

保存数据库

↓

开奖

↓

结算

↓

更新统计
```

---

禁止：

```text
开奖后生成预测
```

---

# 三、结算流程

开奖结果录入后：

```text
读取当期结果

↓

读取当期预测

↓

执行玩法规则

↓

计算命中状态

↓

保存结算结果

↓

更新统计

↓

更新隐藏规则
```

---

# 四、开奖数据结构

开奖结果：

```json
{
  "period":"2026120",

  "numbers":[
    1,
    12,
    18,
    22,
    31,
    44,
    49
  ]
}
```

---

定义：

```text
前6个号码 = 平码

最后1个号码 = 特码
```

---

# 五、结算对象

结算来源：

```text
prediction_record
```

---

例如：

```json
{
  "period":"2026120",

  "play":"平特一肖",

  "prediction":"马"
}
```

---

# 六、单期玩法结算

例如：

```text
平特一肖
```

预测：

```text
马
```

开奖结果：

```text
兔
牛
龙
鸡
猴
蛇
马
```

---

结果：

```text
命中
```

---

保存：

```json
{
  "hit":true
}
```

---

# 七、特码玩法结算

例如：

```text
大小中特
```

预测：

```text
大
```

特码：

```text
49
```

---

结果：

```text
命中
```

---

# 八、绝杀玩法结算

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

---

结果：

```text
命中
```

因为：

```text
特码不属于预测生肖
```

---

# 九、多期玩法结算

例如：

```text
三期三肖
```

---

预测：

```text
马
羊
猴
```

---

有效期：

```text
120期

121期

122期
```

---

开奖：

```text
120 未中

121 命中

122 未中
```

---

结果：

```text
整组命中
```

---

保存：

```json
{
  "group_hit":true
}
```

---

# 十、多期玩法组规则

支持：

```text
二期

三期

四期

五期
```

---

统一结构：

```json
{
  "group_size":3
}
```

---

判定：

```text
组内任意一期命中

即整组命中
```

---

# 十一、结算状态

系统状态：

```text
WAITING

HIT

MISS

UPDATING

HIDDEN
```

---

说明：

WAITING

```text
等待开奖
```

---

HIT

```text
命中
```

---

MISS

```text
未命中
```

---

UPDATING

```text
更新中
```

---

HIDDEN

```text
隐藏
```

---

# 十二、连错统计

每个玩法维护：

```text
连续命中

连续错误
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
连续错误=3
```

---

# 十三、连错隐藏规则

默认：

```text
3期
```

---

触发：

```text
连续MISS >= 3
```

---

执行：

```text
隐藏之前历史预测
```

---

例如：

```text
001期

002期

003期
```

全部隐藏。

---

只保留：

```text
当前开始之后的数据
```

---

# 十四、更新中规则

默认：

```text
关闭
```

---

开启后：

```text
show_updating = true
```

---

触发：

```text
连续错误 >= 3
```

---

生成：

```text
下一期 更新中

下二期 更新中
```

---

示例：

```text
2026121

更新中

2026122

更新中
```

---

特点：

```text
灰色字体

无预测内容

不可参与统计
```

---

# 十五、统计更新

结算完成后：

自动更新：

```text
总命中率

近10期

近30期

近100期
```

---

计算来源：

```text
prediction_record
```

---

# 十六、采种独立结算

香港：

```text
独立结算
```

---

澳门：

```text
独立结算
```

---

禁止：

```text
交叉统计
```

---

例如：

```text
香港统计
```

不能包含：

```text
澳门数据
```

---

# 十七、重新结算机制

以下情况触发：

---

修改开奖结果

```text
重新结算
```

---

修改玩法规则

```text
重新结算
```

---

修改属性规则

```text
重新结算
```

---

# 十八、批量结算

支持：

```text
单期结算

批量结算

全年重算
```

---

例如：

```text
重算2026全年
```

---

执行：

```text
读取全年结果

读取全年预测

重新结算
```

---

# 十九、数据库设计

## settlement_record

```sql
id bigint

site_id bigint

lottery_type varchar(20)

play_id bigint

period varchar(20)

prediction_content text

result_content text

status varchar(20)

hit boolean

created_at timestamp
```

---

## miss_tracker

```sql
id bigint

site_id bigint

play_id bigint

lottery_type varchar(20)

current_hit_streak int

current_miss_streak int

updated_at timestamp
```

---

# 二十、结算引擎输出

标准输出：

```json
{
  "play_id":1,

  "period":"2026120",

  "hit":true,

  "status":"HIT",

  "miss_streak":0,

  "hit_streak":3
}
```

---

# 二十一、AI限制

AI禁止：

```text
参与结算
```

---

AI禁止：

```text
修改结算结果
```

---

AI只能：

```text
修改规则

新增玩法

生成预测
```

---

# 二十二、开发冻结规则

```text
规则1：
全年预测一次生成

规则2：
开奖后只核对

规则3：
前6个号码为平码

规则4：
最后1个号码为特码

规则5：
支持多期玩法

规则6：
支持绝杀玩法

规则7：
支持隐藏规则

规则8：
支持更新中规则

规则9：
支持批量重算

规则10：
香港澳门独立统计
```

---

# 最终结论

结算引擎统一流程：

```text
开奖结果

↓

读取预测

↓

规则匹配

↓

命中判定

↓

统计更新

↓

隐藏规则

↓

更新中规则

↓

完成
```

