# 23-site-layout-library-v1.0（网站布局库规范）

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
10-site-engine-v1.0

21-ui-component-library-v1.0

22-theme-library-v1.0

25-ai-command-dictionary-v1.0
```

---

# 一、设计目标

Layout Engine负责：

```text
决定组件摆放顺序

决定首页结构

决定栏目结构

决定广告插入规则

决定懒加载规则
```

原则：

```text
布局 ≠ 主题

布局 ≠ 组件

布局 = 组件排列规则
```

---

# 二、布局架构

网站生成流程：

```text
Theme
 ↓

Layout
 ↓

Component
 ↓

Page
 ↓

Website
```

例如：

```text
红金主题

+

Layout_A

+

玩法模板03

=

最终网站
```

---

# 三、页面体系

系统固定页面：

```text
首页

开奖记录页

统计页

玩法栏目页
```

---

# 四、首页固定组件

所有网站必须存在：

```text
顶部Logo

开奖模块

轮播图

采种切换

底部导航
```

禁止删除。

允许：

```text
修改样式

修改模板

调整高度

调整内容
```

---

# 五、首页默认结构

标准首页：

```text
01 Logo

02 开奖模块

03 轮播图

04 香港/澳门切换

05 玩法

06 玩法

07 广告

08 玩法

09 玩法

10 栏目入口

11 玩法

12 广告

13 玩法

14 玩法

15 栏目入口

16 玩法

17 广告

18 玩法

19 玩法

20 栏目入口

...

底部导航
```

---

# 六、首页生成规则

首次建站默认生成：

```text
50个玩法模块

10个广告模块

3个栏目入口模块
```

---

系统自动计算：

```text
玩法模块总数

广告插入位置

栏目插入位置
```

---

# 七、栏目插入规则

固定：

```text
3个栏目入口
```

例如：

```text
平特一肖专区

杀码专区

连肖专区
```

---

插入位置：

```text
第10个模块

第25个模块

第40个模块
```

---

支持：

```text
后台修改

AI修改
```

---

# 八、广告插入规则

默认：

```text
每5个玩法插入1个广告
```

即：

```text
P P P P P

AD

P P P P P

AD
```

---

默认生成：

```text
10个广告位
```

支持：

```text
图片广告

文字广告

AI广告

弹窗广告
```

---

# 九、布局模板库

系统默认内置：

```text
Layout_A

Layout_B

Layout_C

Layout_D

Layout_E
```

---

# 十、Layout_A

标准布局

结构：

```text
Logo

开奖

轮播

采种

玩法

玩法

广告

玩法

玩法

栏目

玩法

广告

玩法

玩法

栏目

...
```

特点：

```text
均衡

默认推荐
```

---

# 十一、Layout_B

玩法优先布局

结构：

```text
Logo

开奖

采种

玩法

玩法

玩法

玩法

广告

玩法

玩法

栏目

...
```

特点：

```text
玩法密集

广告较少
```

---

# 十二、Layout_C

广告优先布局

结构：

```text
Logo

开奖

轮播

广告

玩法

广告

玩法

广告

玩法
```

特点：

```text
高变现
```

---

# 十三、Layout_D

栏目优先布局

结构：

```text
Logo

开奖

栏目

栏目

栏目

玩法

广告

玩法
```

特点：

```text
适合大型站
```

---

# 十四、Layout_E

极简布局

结构：

```text
Logo

开奖

玩法

玩法

玩法

玩法

底部导航
```

特点：

```text
加载最快
```

---

# 十五、玩法栏目页布局

例如：

```text
平特一肖专区
```

页面结构：

```text
栏目头图

栏目简介

玩法列表

分页

广告
```

---

玩法数量：

```text
默认50条
```

支持：

```text
分页

无限滚动

懒加载
```

---

# 十六、开奖记录页布局

结构：

```text
开奖信息

开奖筛选

开奖记录列表

分页
```

---

显示：

```text
期号

开奖时间

7个号码

全部属性
```

---

支持：

```text
香港

澳门
```

切换。

---

# 十七、统计页布局

结构：

```text
统计总览

热门玩法

命中排行

最近命中

排行榜
```

---

显示：

```text
总命中率

近10期

近30期

近100期
```

---

# 十八、采种切换布局

系统支持：

```text
香港

澳门
```

---

切换后：

```text
开奖结果

玩法数据

统计数据

栏目数据
```

全部同步切换。

---

# 十九、懒加载规则

首页必须启用：

```text
lazy_load = true
```

---

首次打开：

```text
加载前10个模块
```

---

继续下拉：

```text
每次加载5个模块
```

---

支持：

```text
图片懒加载

广告懒加载

玩法懒加载
```

---

# 二十、移动端布局规则

所有布局优先移动端。

组件宽度：

```text
100%
```

---

卡片间距：

```text
8px
```

---

广告间距：

```text
12px
```

---

底部导航固定：

```text
position: fixed
```

---

# 二十一、布局数据库设计

## layout_library

```sql
id bigint

code varchar(50)

name varchar(100)

description text

config json

enabled boolean
```

---

## site_layout

```sql
id bigint

site_id bigint

layout_code varchar(50)

active boolean
```

---

# 二十二、AI布局控制规范

AI允许：

```text
切换布局

新增布局

删除布局

调整布局

复制布局
```

---

例如：

用户：

```text
首页广告减少一半
```

解析：

```json
{
  "action":"modify_layout",
  "ad_count":5
}
```

---

用户：

```text
栏目放到前面
```

解析：

```json
{
  "action":"move_component",
  "component":"category_entry",
  "position":"top"
}
```

---

用户：

```text
增加20个玩法模块
```

解析：

```json
{
  "action":"add_play_modules",
  "count":20
}
```

---

# 二十三、布局DSL规范

布局统一采用DSL描述。

例如：

```yaml
layout:

  - logo

  - result_board

  - banner_slider

  - lottery_switch

  - play_card*5

  - image_ad

  - play_card*5

  - category_entry

  - play_card*5
```

---

AI只允许修改DSL。

禁止修改页面代码。

---

# 二十四、自动布局生成器

Site Engine生成网站时：

输入：

```json
{
  "theme":"theme_red_gold",
  "layout":"layout_a",
  "play_count":50,
  "ad_count":10,
  "category_count":3
}
```

输出：

```text
完整首页

开奖记录页

统计页

栏目页
```

---

# 二十五、开发冻结规则

```text
规则1：
页面禁止写死

规则2：
布局必须DSL化

规则3：
AI只能修改布局DSL

规则4：
支持无限布局扩展

规则5：
支持后台管理布局

规则6：
支持布局导入导出

规则7：
支持布局版本管理

规则8：
支持实时切换布局
```

---

# 二十六、布局引擎输出标准

Layout Engine输出：

```json
{
  "layout":"layout_a",

  "components":[
    "logo",
    "result_board",
    "banner_slider",
    "lottery_switch",
    "play_card",
    "image_ad",
    "category_entry"
  ]
}
```

---

# 文档结论

本规范确定：

```text
网站结构 ≠ 页面代码

网站结构 = Layout DSL
```

最终形成：

```text
Theme Library
      ↓

Layout Library
      ↓

Component Library
      ↓

Website Engine
      ↓

Website
```

---


