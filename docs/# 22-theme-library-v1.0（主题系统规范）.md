# 22-theme-library-v1.0（主题系统规范）

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
21-ui-component-library-v1.0

24-site-layout-library-v1.0

25-ai-command-dictionary-v1.0
```

---

# 一、设计目标

Theme Engine负责控制：

```text
网站整体视觉风格

页面配色

字体

圆角

阴影

边框

动画

按钮

卡片样式

广告样式
```

原则：

```text
主题 ≠ 页面

主题 ≠ 模板

主题 = 视觉规则
```

---

# 二、主题架构

网站渲染流程：

```text
Theme
  ↓

Layout
  ↓

Component
  ↓

Website
```

例如：

```text
红金主题

+

布局A

+

玩法卡片模板03

=

最终网站
```

---

# 三、主题等级

系统支持：

```text
L1 全站主题

L2 页面主题

L3 组件主题

L4 自定义主题
```

---

# 四、默认主题库

系统首次安装默认提供：

---

## T001 默认主题

编码：

```text
theme_default
```

风格：

```text
简洁

白底

蓝色主色
```

适用于：

```text
默认站点
```

---

## T002 红金主题

编码：

```text
theme_red_gold
```

风格：

```text
红色

金色

节日风格
```

主色：

```css
#C62828
#FFD700
```

适用于：

```text
热门站点

活动站
```

---

## T003 科技主题

编码：

```text
theme_tech
```

风格：

```text
深色

科技蓝

发光效果
```

主色：

```css
#00BFFF
#0A192F
```

---

## T004 暗黑主题

编码：

```text
theme_dark
```

风格：

```text
深色背景

极简
```

---

## T005 商务主题

编码：

```text
theme_business
```

风格：

```text
专业

灰黑色
```

---

## T006 极简主题

编码：

```text
theme_minimal
```

风格：

```text
留白

无边框

轻量化
```

---

# 五、主题结构

每个主题由：

```yaml
theme:
  colors:
  typography:
  radius:
  shadow:
  animation:
  spacing:
```

组成。

---

# 六、颜色系统

## 主色

```yaml
primary:
```

用于：

```text
按钮

导航

高亮
```

---

## 辅助色

```yaml
secondary:
```

用于：

```text
标签

卡片
```

---

## 成功色

```yaml
success:
```

用于：

```text
命中

正确
```

---

## 失败色

```yaml
danger:
```

用于：

```text
未命中

连错
```

---

## 警告色

```yaml
warning:
```

用于：

```text
更新中
```

---

## 背景色

```yaml
background:
```

---

## 文字色

```yaml
text:
```

---

标准示例：

```yaml
colors:
  primary: "#C62828"
  secondary: "#FFD700"
  success: "#22C55E"
  danger: "#EF4444"
  warning: "#F59E0B"
  background: "#FFFFFF"
  text: "#111827"
```

---

# 七、字体系统

统一配置：

```yaml
font:
  family:
  size:
  weight:
```

---

支持：

```text
系统字体

思源黑体

微软雅黑

苹方
```

---

字体等级：

```yaml
h1: 28

h2: 24

h3: 20

body: 16

small: 14
```

---

# 八、圆角系统

支持：

```yaml
radius:
```

---

标准：

```yaml
none: 0

small: 4

medium: 8

large: 16

round: 999
```

---

应用：

```text
按钮

卡片

广告

弹窗
```

---

# 九、阴影系统

支持：

```yaml
shadow:
```

---

等级：

```yaml
none

small

medium

large
```

---

例如：

```css
box-shadow:
0 4px 8px rgba(0,0,0,.08)
```

---

# 十、动画系统

支持：

```yaml
animation:
```

---

动画类型：

```text
fade

slide

zoom

bounce

none
```

---

组件可独立开启：

```yaml
component_animation: true
```

---

# 十一、按钮系统

统一定义：

```yaml
button:
```

---

支持：

```yaml
primary

secondary

success

danger
```

---

示例：

```yaml
button:
  radius: 8
  height: 42
  font_size: 14
```

---

# 十二、玩法卡片主题

针对：

```text
play_card
```

独立支持：

---

## 卡片风格1

```text
经典卡片
```

---

## 卡片风格2

```text
极简卡片
```

---

## 卡片风格3

```text
高亮命中卡片
```

---

## 卡片风格4

```text
排行榜风格
```

---

配置：

```yaml
play_card:
  style: card_03
```

---

# 十三、开奖组件主题

支持：

```text
经典开奖样式

表格式开奖样式

球体开奖样式

数字开奖样式
```

---

例如：

```yaml
result_board:
  style: ball
```

显示：

```text
01
13
25
37
49
```

球体形式展示。

---

# 十四、广告组件主题

支持：

```text
横幅

信息流

弹窗

插屏
```

---

配置：

```yaml
ad:
  style: feed
```

---

# 十五、移动端主题

支持：

```yaml
mobile:
```

---

例如：

```yaml
mobile:
  card_radius: 12
  font_scale: 0.95
```

---

# 十六、主题数据库设计

## theme_library

```sql
id bigint

code varchar(50)

name varchar(100)

description text

config json

enabled boolean
```

---

## site_theme

```sql
id bigint

site_id bigint

theme_code varchar(50)

active boolean
```

---

# 十七、AI主题控制规范

AI允许：

```text
切换主题

修改主题

生成主题

复制主题
```

---

例如：

用户：

```text
把网站改成红金风格
```

AI解析：

```json
{
  "action":"change_theme",
  "theme":"theme_red_gold"
}
```

---

用户：

```text
把命中显示绿色发光
```

AI解析：

```json
{
  "action":"modify_theme",
  "component":"play_card",
  "success_color":"#22C55E",
  "glow":true
}
```

---

# 十八、自定义主题生成

AI支持：

```text
自动生成新主题
```

例如：

```text
生成一个中国风主题
```

AI创建：

```yaml
theme:
  name: chinese_style

  primary: "#B22222"

  secondary: "#D4AF37"

  radius: 6

  animation: fade
```

自动保存：

```text
theme_library
```

---

# 十九、主题继承机制

支持：

```yaml
extends:
```

---

例如：

```yaml
theme_red_gold_v2

extends:

theme_red_gold
```

只修改：

```yaml
play_card:
  style: card_04
```

---

无需复制整个主题。

---

# 二十、开发冻结规则

```text
规则1：
主题不得包含业务逻辑

规则2：
主题只控制视觉

规则3：
所有组件必须支持主题覆盖

规则4：
主题支持AI创建

规则5：
主题支持后台管理

规则6：
主题支持导入导出

规则7：
主题切换实时生效

规则8：
主题支持继承
```

---

# 二十一、主题输出标准

Theme Engine最终输出：

```json
{
  "theme":"theme_red_gold",

  "colors":{
    "primary":"#C62828",
    "secondary":"#FFD700"
  },

  "font":{
    "family":"PingFang SC"
  },

  "radius":{
    "card":12
  },

  "animation":"fade"
}
```

---

# 文档结论

本规范确定：

```text
网站样式 ≠ HTML

网站样式 = Theme Engine
```

最终系统结构：

```text
Theme Library
       ↓

Theme Engine
       ↓

Layout Engine
       ↓

Component Engine
       ↓

Website
```

至此已经具备：

```text
组件库（21）

主题库（22）
```

下一份必须编写：

```text
24-site-layout-library-v1.0
```

因为它决定：

```text
组件如何排列

50玩法如何插入

10广告如何插入

3栏目如何插入

首页如何自动生成
```

这是自动建站引擎的核心文档。
