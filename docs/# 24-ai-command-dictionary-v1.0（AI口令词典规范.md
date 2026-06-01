# 24-ai-command-dictionary-v1.0（AI口令词典规范）

## 文档状态

版本：

```text
v1.0
```

状态：

```text
核心冻结版
```

优先级：

```text
P0
```

依赖：

```text
03-ai-command-center-v1.0

10-site-engine-v1.0

21-ui-component-library-v1.0

22-theme-library-v1.0

23-site-layout-library-v1.0
```

---

# 一、文档目标

实现最终目标：

```text
正常聊天 = 系统操作

无需学习命令

无需学习后台

无需学习DSL
```

例如：

```text
生成一个红金风格的网站

新增20个平特一肖玩法

把广告放少一点

香港放前面

新增一个统计页

删除开奖记录
```

AI自动理解并执行。

---

# 二、AI执行流程

```text
用户口令

↓

Intent识别

↓

Command解析

↓

DSL生成

↓

执行引擎

↓

网站更新
```

---

# 三、口令分类

系统支持：

```text
A 网站管理

B 模板管理

C 布局管理

D 玩法管理

E 数据管理

F 广告管理

G 样式管理

H 页面管理

I 属性管理

J 系统管理
```

---

# 四、网站管理口令

---

## 创建网站

用户：

```text
创建一个网站
```

解析：

```json
{
  "intent":"site_create"
}
```

---

用户：

```text
创建一个红金风格网站
```

解析：

```json
{
  "intent":"site_create",
  "theme":"theme_red_gold"
}
```

---

用户：

```text
创建一个科技风网站
```

解析：

```json
{
  "intent":"site_create",
  "theme":"theme_tech"
}
```

---

用户：

```text
创建一个香港站
```

解析：

```json
{
  "intent":"site_create",
  "lottery":"hk"
}
```

---

用户：

```text
创建一个澳门站
```

解析：

```json
{
  "intent":"site_create",
  "lottery":"mo"
}
```

---

# 五、主题管理口令

---

用户：

```text
换成红金主题
```

解析：

```json
{
  "intent":"change_theme",
  "theme":"theme_red_gold"
}
```

---

用户：

```text
换成暗黑主题
```

解析：

```json
{
  "intent":"change_theme",
  "theme":"theme_dark"
}
```

---

用户：

```text
生成一个中国风主题
```

解析：

```json
{
  "intent":"create_theme",
  "theme_name":"chinese_style"
}
```

---

# 六、布局管理口令

---

用户：

```text
广告减少一半
```

解析：

```json
{
  "intent":"modify_layout",
  "ad_count":"50%"
}
```

---

用户：

```text
增加20个玩法
```

解析：

```json
{
  "intent":"add_play_modules",
  "count":20
}
```

---

用户：

```text
栏目放前面
```

解析：

```json
{
  "intent":"move_component",
  "component":"category_entry",
  "position":"top"
}
```

---

用户：

```text
开奖放最上面
```

解析：

```json
{
  "intent":"move_component",
  "component":"result_board",
  "position":"top"
}
```

---

# 七、玩法管理口令

---

用户：

```text
新增一个平特一肖玩法
```

解析：

```json
{
  "intent":"create_play",
  "play_name":"平特一肖"
}
```

---

用户：

```text
新增20个平特一肖
```

解析：

```json
{
  "intent":"batch_create_play",
  "play_name":"平特一肖",
  "count":20
}
```

---

用户：

```text
删除杀码玩法
```

解析：

```json
{
  "intent":"delete_play",
  "keyword":"杀码"
}
```

---

用户：

```text
隐藏命中率低于60%的玩法
```

解析：

```json
{
  "intent":"hide_play",
  "condition":"hit_rate < 60"
}
```

---

# 八、玩法样式口令

---

用户：

```text
把玩法改成卡片风格
```

解析：

```json
{
  "intent":"change_component_template",
  "component":"play_card",
  "template":"card"
}
```

---

用户：

```text
玩法字体放大
```

解析：

```json
{
  "intent":"modify_component_style",
  "component":"play_card",
  "font_size":"+2"
}
```

---

用户：

```text
命中显示绿色发光
```

解析：

```json
{
  "intent":"modify_theme",
  "success_color":"#22C55E",
  "glow":true
}
```

---

# 九、广告管理口令

---

用户：

```text
增加10个广告
```

解析：

```json
{
  "intent":"add_ad",
  "count":10
}
```

---

用户：

```text
删除所有广告
```

解析：

```json
{
  "intent":"remove_all_ads"
}
```

---

用户：

```text
生成科技风广告
```

解析：

```json
{
  "intent":"generate_ad",
  "theme":"tech"
}
```

---

# 十、开奖结果管理口令

---

用户：

```text
录入第2026120期开奖结果
```

解析：

```json
{
  "intent":"create_result",
  "period":"2026120"
}
```

---

用户：

```text
修改第2026120期
```

解析：

```json
{
  "intent":"update_result",
  "period":"2026120"
}
```

---

用户：

```text
删除第2026120期
```

解析：

```json
{
  "intent":"delete_result",
  "period":"2026120"
}
```

---

# 十一、采种管理口令

---

用户：

```text
香港放前面
```

解析：

```json
{
  "intent":"change_lottery_sort",
  "order":["hk","mo"]
}
```

---

用户：

```text
默认打开澳门
```

解析：

```json
{
  "intent":"default_lottery",
  "lottery":"mo"
}
```

---

# 十二、统计管理口令

---

用户：

```text
增加命中排行榜
```

解析：

```json
{
  "intent":"add_component",
  "component":"hit_rank"
}
```

---

用户：

```text
删除统计页
```

解析：

```json
{
  "intent":"delete_page",
  "page":"statistics"
}
```

---

# 十三、页面管理口令

---

用户：

```text
新增一个VIP页面
```

解析：

```json
{
  "intent":"create_page",
  "page_name":"VIP"
}
```

---

用户：

```text
删除开奖记录页面
```

解析：

```json
{
  "intent":"delete_page",
  "page":"history_result"
}
```

---

# 十四、属性管理口令

---

用户：

```text
新增东西南北属性
```

解析：

```json
{
  "intent":"create_attribute_group",
  "group":"direction"
}
```

---

用户：

```text
新增一个生肖分类
```

解析：

```json
{
  "intent":"create_attribute_group",
  "group":"zodiac_custom"
}
```

---

# 十五、规则管理口令

---

用户：

```text
连错三期隐藏
```

解析：

```json
{
  "intent":"update_rule",
  "rule":"hide_after_miss",
  "value":3
}
```

---

用户：

```text
连错三期显示两期更新中
```

解析：

```json
{
  "intent":"update_rule",
  "rule":"show_updating",
  "value":2
}
```

---

用户：

```text
关闭更新中
```

解析：

```json
{
  "intent":"update_rule",
  "rule":"show_updating",
  "value":0
}
```

---

# 十六、AI自动补全规则

用户说：

```text
换个好看点的主题
```

AI自动推断：

```json
{
  "intent":"change_theme",
  "theme":"theme_red_gold"
}
```

---

用户说：

```text
广告太多了
```

AI自动推断：

```json
{
  "intent":"modify_layout",
  "ad_count":"-50%"
}
```

---

用户说：

```text
网站太乱
```

AI自动推断：

```json
{
  "intent":"change_layout",
  "layout":"layout_e"
}
```

---

# 十七、多命令解析

用户：

```text
换红金主题，把广告减半，再增加20个玩法
```

解析：

```json
{
  "commands":[
    {
      "intent":"change_theme",
      "theme":"theme_red_gold"
    },
    {
      "intent":"modify_layout",
      "ad_count":"50%"
    },
    {
      "intent":"add_play_modules",
      "count":20
    }
  ]
}
```

---

# 十八、AI执行权限

普通管理员：

```text
修改网站

修改样式

修改广告

修改玩法
```

---

超级管理员：

```text
删除网站

删除数据库

新增系统规则

新增玩法DSL
```

---

# 十九、执行日志

所有AI操作记录：

```sql
ai_command_log
```

结构：

```sql
id

site_id

user_id

command

intent

result

created_at
```

---

# 二十、AI执行确认机制

高风险操作必须确认：

---

例如：

```text
删除网站
```

AI回复：

```text
确认删除网站？

回复：

确认删除
```

才执行。

---

# 二十一、未来扩展

后续支持：

```text
语音控制

微信群机器人

Telegram机器人

API机器人

企业微信机器人
```

统一转换：

```json
{
  "intent":"xxx"
}
```

执行。

---

# 二十二、开发冻结规则

```text
规则1：
所有AI口令必须转换Intent

规则2：
禁止AI直接操作数据库

规则3：
AI只能操作DSL

规则4：
AI必须记录日志

规则5：
高风险操作必须确认

规则6：
支持多命令解析

规则7：
支持自然语言

规则8：
支持无限扩展
```

---

# 二十三、最终系统架构

```text
用户

↓

自然语言

↓

AI Command Center

↓

Command Dictionary

↓

Intent Parser

↓

DSL Generator

↓

Site Engine

↓

Website
```


