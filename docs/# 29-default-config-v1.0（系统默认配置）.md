# 29-default-config-v1.0（系统默认配置）

## 文档状态

```text
版本：v1.0
状态：冻结版
优先级：P0
用途：
- 系统初始化
- Seeder导入
- 新站点默认配置
- AI默认规则
```

---

# 一、系统级默认配置

## system_setting

```json
{
  "system_name": "AI预测站群系统",

  "timezone": "Asia/Shanghai",

  "language": "zh-CN",

  "enable_ai": true,

  "enable_cache": true,

  "enable_statistics": true,

  "enable_auto_settlement": true,

  "enable_auto_publish": true
}
```

---

# 二、采种默认配置

## 香港

```json
{
  "code":"hk",
  "name":"香港"
}
```

---

## 澳门

```json
{
  "code":"macau",
  "name":"澳门",
  "draw_time":"21:30"
}
```

---

# 三、网站默认生成配置

创建站点时默认生成：

```json
{
  "play_count":50,

  "ad_count":10,

  "category_count":3,

  "enable_lazy_load":true
}
```

---

# 四、首页默认结构

固定结构：

```text
顶部LOGO
↓
开奖栏
↓
轮播图
↓
采种切换
↓
随机版块
↓
底部导航
```

---

## 固定组件

```json
[
  "logo",
  "result",
  "banner",
  "lottery_switch",
  "bottom_nav"
]
```

---

## 栏目页插入规则

50个玩法版块中插入：

```json
[
  {
    "position":"1/4",
    "type":"category"
  },
  {
    "position":"2/4",
    "type":"category"
  },
  {
    "position":"3/4",
    "type":"category"
  }
]
```

---

# 五、默认栏目

系统生成时固定创建：

```json
[
  {
    "name":"开奖记录",
    "slug":"history"
  },
  {
    "name":"玩法大全",
    "slug":"plays"
  },
  {
    "name":"命中统计",
    "slug":"statistics"
  }
]
```

---

# 六、默认页面

自动生成：

```text
首页

开奖记录

玩法详情页

统计页
```

---

# 七、预测数据配置

## 核心规则

```text
每年最多366期

每年只生成一次预测数据

开奖后仅做结算

不允许开奖后重新生成预测

统计按年度计算
```

---

## 默认配置

```json
{
  "max_period_per_year":366,

  "generate_once_per_year":true,

  "allow_regenerate":false
}
```

---

# 八、开奖配置

## 默认状态

```json
{
  "result_input_mode":"manual",

  "enable_api_import":false
}
```

---

说明：

```text
一期开奖包含：

6个平码

1个特码
```

---

# 九、统计配置

## 命中率统计

固定：

```json
{
  "enable_total":true,

  "enable_last_10":true,

  "enable_last_30":true,

  "enable_last_100":true
}
```

---

展示：

```text
总命中率

近10期

近30期

近100期
```

---

# 十、隐藏规则配置

## 连错隐藏

默认：

```json
{
  "miss_hide_limit":3
}
```

规则：

```text
连续错3期

隐藏错期之前所有预测内容

仅显示隐藏后内容
```

---

例如：

```text
001 中

002 中

003 错

004 错

005 错
```

达到：

```text
连续错3期
```

则：

```text
001~005
隐藏
```

从下一期重新开始显示。

---

# 十一、更新中规则

## 默认关闭

```json
{
  "show_updating":false,

  "updating_count":2
}
```

---

开启后：

```text
连续错3期
```

自动追加：

```text
2026011
更新中

2026012
更新中
```

---

显示格式：

```text
2026011

正在更新
```

---

要求：

```text
字体灰色

整体居中

不显示预测内容
```

---

# 十二、AI默认配置

```json
{
  "auto_create_site":true,

  "auto_create_page":true,

  "auto_create_component":true,

  "auto_generate_prediction":true
}
```

---

# 十三、广告默认配置

```json
{
  "default_ad_count":10,

  "enable_ad_module":true
}
```

---

# 十四、缓存配置

```json
{
  "statistics_cache_minutes":30,

  "homepage_cache_minutes":10
}
```

---

# 十五、后台权限默认配置

## SuperAdmin

```json
[
  "*"
]
```

---

## Admin

```json
[
  "site",
  "play",
  "result",
  "statistics"
]
```

---

## Editor

```json
[
  "result",
  "statistics"
]
```

---

# 十六、默认主题

```json
{
  "theme":"default_blue",

  "layout":"layout_a"
}
```

---

# 十七、默认SEO

```json
{
  "title":"免费精准预测平台",

  "keywords":"平特一肖,六肖,平特一肖预测,澳门六合彩,香港六合彩",

  "description":"提供香港澳门预测数据及历史统计分析"
}
```

---

# 十八、默认站点状态

```json
{
  "site_status":"draft"
}
```

创建完成后：

```text
草稿状态
```

管理员发布后：

```text
正式上线
```

---

# 十九、Seeder导入顺序

```text
1 system_setting

2 lottery_type

3 theme

4 layout

5 play_rule

6 attribute_library

7 default_page

8 default_component
```

---

# 二十、最终冻结配置

```text
香港：
按开奖日历开奖

澳门：
每天21:30开奖

前6个号码：
平码

最后1个号码：
特码

大小：
01~24 小
25~49 大

全年最多：
366期

预测：
每年生成一次

统计：
总命中率
近10期
近30期
近100期

连续错3期：
隐藏历史预测

更新中：
默认关闭

默认网站：
50玩法
10广告
3栏目
```

---

 
