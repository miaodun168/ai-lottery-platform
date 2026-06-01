# 04-template-engine-v1.0（模板引擎设计）

> 项目：AI自动建站与自动运维系统
> 模块：Template Engine（模板引擎）
> 版本：v1.0
> 状态：架构冻结版

---

# 一、模块目标

模板引擎负责：

```text
网站模板管理

板块模板管理

组件模板管理

样式模板管理

AI模板生成

AI模板修改

模板市场管理
```

最终实现：

```text
一个网站
可随时切换风格

一个玩法
可随时切换展示样式

AI可直接修改模板

人工可直接修改模板
```

---

# 二、模板架构总览

系统采用四层模板架构：

```text
Site Template
网站模板

    ↓

Page Template
页面模板

    ↓

Block Template
板块模板

    ↓

Component Template
组件模板
```

---

# 三、网站模板（Site Template）

控制：

```text
整体布局

导航

页脚

背景

主题色

字体

SEO结构
```

---

## 示例

### 红金版

```yaml
name: red-gold

theme:
  red
  gold

layout:
  classic
```

---

### 黑金版

```yaml
name: black-gold

theme:
  black
  gold
```

---

### 蓝色科技版

```yaml
name: blue-tech

theme:
  blue

effect:
  tech
```

---

# 网站模板结构

```yaml
SiteTemplate:

id:

name:

code:

version:

thumbnail:

description:

schema:
```

---

## schema示例

```yaml
header:

sidebar:

content:

footer:
```

---

# 四、页面模板（Page Template）

控制：

```text
首页

玩法页

开奖页

历史页

统计页

广告页
```

---

## 首页模板

例如：

```text
模板A

轮播图
↓
热门玩法
↓
推荐玩法
↓
广告
↓
历史记录
```

---

## 首页模板B

```text
公告
↓
热门玩法
↓
广告
↓
统计
↓
开奖记录
```

---

# PageTemplate

```yaml
id:

name:

type:

layout_json:
```

---

# 五、板块模板（Block Template）

最重要。

---

例如：

```text
平特一肖
```

规则一样。

展示方式不同。

---

## 模板A

```text
标题

预测生肖

命中率

立即查看
```

---

## 模板B

```text
生肖图标

预测结果

统计

走势图
```

---

## 模板C

```text
卡片式展示
```

---

# BlockTemplate

```yaml
id:

name:

play_type:

schema:

style:
```

---

# 六、组件模板（Component Template）

最小单位。

---

例如：

## 按钮

```text
红色按钮

金色按钮

渐变按钮
```

---

## 卡片

```text
卡片A

卡片B

卡片C
```

---

## 表格

```text
开奖表格

统计表格
```

---

## Banner

```text
横幅

轮播

广告位
```

---

# ComponentTemplate

```yaml
id:

name:

type:

html:

css:

js:
```

---

# 七、样式系统

模板与样式分离。

---

## Template

负责：

```text
结构
```

---

## Style

负责：

```text
颜色

边框

阴影

字体

动画
```

---

例如：

同一个模板：

```text
经典布局
```

可切换：

```text
红金

黑金

蓝色

绿色

紫色
```

---

# StyleTheme

```yaml
id:

name:

primary_color:

secondary_color:

background:

font:

border:
```

---

# 八、模板版本管理

所有模板必须支持版本。

---

## TemplateVersion

```yaml
id:

template_id:

version:

change_log:

created_at:
```

---

例如：

```text
v1.0

v1.1

v1.2
```

---

# 九、AI模板生成

管理员输入：

```text
生成一个黑金风格模板
```

---

AI执行：

```text
生成布局

生成配色

生成组件

生成样式
```

---

生成：

```yaml
template:
  black-gold-v001
```

---

# 十、AI模板修改

管理员：

```text
把首页改成赛博朋克风格
```

---

AI解析：

```yaml
action:
template.modify
```

---

修改：

```text
背景

字体

颜色

按钮

动画
```

---

自动发布。

---

# 十一、模板市场

后期支持。

---

## 官方模板

```text
red-gold

black-gold

blue-tech
```

---

## 用户模板

```text
user-template-001
```

---

## AI模板

```text
ai-template-001
```

---

# 十二、玩法模板系统

核心。

---

一个玩法：

```text
平特一肖
```

支持：

```text
模板A

模板B

模板C

模板D
```

---

切换：

```text
规则不变

展示变化
```

---

例如：

### 模板A

```text
文字展示
```

---

### 模板B

```text
生肖图标展示
```

---

### 模板C

```text
走势图展示
```

---

# PlayTemplateBinding

```yaml
play_id:

template_id:
```

---

# 十三、广告模板系统

支持：

```text
顶部广告

底部广告

浮窗广告

弹窗广告

插屏广告
```

---

## AdTemplate

```yaml
id:

name:

type:

layout:
```

---

# 十四、多站点模板继承

支持：

```text
总站模板
    ↓
站点模板
```

---

例如：

```text
默认模板

↓

财富阁

↓

财富阁专属修改
```

---

这样：

```text
更新默认模板

全部站同步
```

但：

```text
保留站点个性修改
```

---

# 十五、人工修改原则

所有模板：

```text
允许AI修改

允许人工修改
```

---

优先级：

```text
系统模板

↓

AI修改

↓

人工修改
```

---

人工永远最高。

---

# 十六、模板存储结构

推荐：

```text
template/

site/

page/

block/

component/

style/
```

---

数据库：

```yaml
site_template

page_template

block_template

component_template

style_theme

template_version
```

---

# 十七、V1开发范围

必须实现：

```text
网站模板

页面模板

玩法模板

广告模板

样式主题

模板版本

AI修改模板

人工修改模板
```

---

# 十八、V2开发范围

实现：

```text
AI自动生成模板

模板市场

模板导入导出

模板分享

模板评分系统
```

---

# 十九、开发原则（必须遵守）

## 原则1

模板与数据彻底分离

```text
模板负责展示

数据负责内容
```

---

## 原则2

模板与规则彻底分离

```text
玩法规则

永远不写进模板
```

---

## 原则3

模板必须可AI编辑

不能写死。

---

## 原则4

模板必须可人工编辑

AI生成后必须允许继续改。

---

# 模板引擎最终目标

未来管理员只需输入：

```text
把财富阁改成黑金风格

把平特一肖改成卡片模式

生成一个新的首页模板

替换全部广告模板
```

AI自动完成：

```text
模板生成

模板修改

模板替换

模板发布
```

无需进入后台手工操作。
