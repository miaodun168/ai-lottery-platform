# 21-ui-component-library-v1.0（UI组件库规范）

## 文档状态

版本：

```text
v1.0
```

状态：

```text
冻结版
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

24-site-layout-library-v1.0
```

---

# 一、设计目标

整个系统采用：

```text
组件化网站引擎
(Component Driven Website Engine)
```

原则：

```text
网站 = 页面

页面 = 组件集合

组件 = 模板 + 数据 + 样式
```

AI只能操作组件。

禁止直接修改页面代码。

---

# 二、组件等级

系统组件分为：

```text
L1 固定组件

L2 内容组件

L3 功能组件

L4 广告组件

L5 容器组件
```

---

# 三、L1 固定组件

这些组件默认每个网站必须存在。

---

## C001 Logo组件

编码：

```text
logo
```

位置：

```text
首页顶部
```

功能：

```text
网站Logo

网站名称

网站副标题
```

支持：

```text
图片Logo

文字Logo

图片+文字
```

配置：

```json
{
  "logo":"",
  "title":"",
  "subtitle":""
}
```

---

## C002 开奖组件

编码：

```text
result_board
```

位置：

```text
首页顶部固定
```

功能：

```text
显示最新开奖

显示采种

显示开奖时间

显示期号
```

显示内容：

```text
第2026101期

01
13
22
25
31
46
49
```

属性展开：

```text
号码

生肖

波色

五行
```

支持：

```text
折叠

展开
```

---

## C003 轮播图组件

编码：

```text
banner_slider
```

功能：

```text
轮播广告

活动公告

图片跳转
```

支持：

```text
自动播放

手动切换
```

---

## C004 采种导航组件

编码：

```text
lottery_switch
```

功能：

```text
香港

澳门
```

切换后：

```text
开奖数据切换

玩法数据切换

统计数据切换
```

---

## C005 底部导航组件

编码：

```text
bottom_nav
```

固定显示：

```text
首页

开奖记录

玩法内页

统计中心

客服
```

支持：

```text
图标

文字

图标+文字
```

---

# 四、L2 内容组件

---

## C101 玩法组件

编码：

```text
play_card
```

这是系统最重要组件。

---

显示：

```text
玩法名称

预测内容

命中率

更新时间

历史记录
```

例如：

```text
平特一肖

马

总命中率 82%

2026101期
```

---

支持模板：

```text
卡片模式

表格模式

列表模式

极简模式
```

---

支持AI修改：

```text
颜色

边框

字体

动画

布局
```

---

## C102 多期玩法组件

编码：

```text
multi_period_play
```

例如：

```text
三期三肖

五期三肖

十期六码
```

显示：

```text
开始期号

结束期号

当前进度

命中状态
```

---

## C103 栏目入口组件

编码：

```text
category_entry
```

例如：

```text
平特一肖专区

连肖专区

杀码专区
```

点击进入：

```text
栏目内页
```

---

## C104 统计组件

编码：

```text
statistics_card
```

显示：

```text
总命中率

近10期

近30期

近100期
```

支持：

```text
图表

进度条

数字模式
```

---

# 五、L3 功能组件

---

## C201 开奖历史组件

编码：

```text
history_result
```

显示：

```text
历史期号

历史号码

历史属性
```

支持：

```text
分页

搜索

日期筛选
```

---

## C202 属性详情组件

编码：

```text
attribute_detail
```

显示：

```text
号码

生肖

波色

五行

属性
```

例如：

```text
25

马

蓝波

金

大
```

---

## C203 公告组件

编码：

```text
notice_board
```

显示：

```text
网站公告

活动公告

系统公告
```

---

## C204 客服组件

编码：

```text
service_box
```

支持：

```text
QQ

微信

Telegram

WhatsApp
```

---

# 六、L4 广告组件

---

## C301 图片广告

编码：

```text
image_ad
```

支持：

```text
单图

双图

横幅
```

---

## C302 文字广告

编码：

```text
text_ad
```

显示：

```text
广告标题

广告内容

跳转链接
```

---

## C303 AI广告组件

编码：

```text
ai_ad
```

AI自动生成：

```text
广告标题

广告文案

按钮文案
```

---

## C304 弹窗广告

编码：

```text
popup_ad
```

支持：

```text
首次打开

每小时一次

每日一次
```

---

# 七、L5 容器组件

---

## C401 首页容器

编码：

```text
home_container
```

用于组合：

```text
Logo

开奖

轮播

采种

玩法

广告

栏目
```

---

## C402 栏目页容器

编码：

```text
category_container
```

例如：

```text
平特一肖专区
```

内部：

```text
50个玩法
```

---

## C403 统计页容器

编码：

```text
statistics_container
```

显示：

```text
命中排行

命中统计

热门玩法
```

---

## C404 开奖页容器

编码：

```text
result_container
```

显示：

```text
开奖记录
```

---

# 八、组件公共属性

所有组件统一支持：

```json
{
  "id":"",
  "name":"",
  "template":"",
  "theme":"",
  "visible":true,
  "sort":1,
  "mobile":true,
  "desktop":true
}
```

---

# 九、组件模板机制

每个组件支持多个模板。

例如：

```text
play_card
```

可拥有：

```text
play_card_01

play_card_02

play_card_03

play_card_04
```

AI可切换：

```text
替换首页玩法卡片为模板3
```

---

# 十、AI组件控制规范

AI允许：

```text
新增组件

删除组件

隐藏组件

排序组件

替换组件模板

修改组件样式

修改组件数据源
```

例如：

```text
把广告放到第3个玩法后面
```

转换：

```json
{
  "action":"move_component",
  "component":"image_ad",
  "position":"after_play_3"
}
```

---

# 十一、首页默认结构

首次生成网站：

```text
Logo

开奖

轮播图

采种切换

玩法1

玩法2

广告

玩法3

玩法4

栏目入口

玩法5

广告

...

共：

50个玩法

10个广告

3个栏目入口
```

全部采用：

```text
懒加载
```

---

# 十二、组件数据库设计

## ui_component

```sql
id bigint

code varchar(50)

name varchar(100)

type varchar(50)

template varchar(50)

config json

enabled boolean
```

---

## ui_component_instance

```sql
id bigint

site_id bigint

component_code varchar(50)

sort int

config json
```

---

# 十三、开发冻结规则

```text
规则1：
页面禁止写死HTML

规则2：
所有页面必须组件化

规则3：
AI只能操作组件

规则4：
组件支持无限模板

规则5：
组件支持后台管理

规则6：
组件支持拖拽排序

规则7：
组件支持AI新增

规则8：
组件支持懒加载
```

---

# 文档结论

本规范确定：

```text
页面 ≠ HTML

页面 = 组件树
```

最终架构：

```text
Theme Engine
      ↓
Layout Engine
      ↓
UI Component Engine
      ↓
Website
```

 
