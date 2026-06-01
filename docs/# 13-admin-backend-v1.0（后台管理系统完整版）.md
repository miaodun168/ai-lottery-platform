# 13-admin-backend-v1.0（后台管理系统完整版）

## 文档状态

版本：v1.0

状态：P0核心模块

优先级：

```text
最高
```

依赖：

```text
00-global-business-rules-v1.0

01-domain-model-v1.4

03-ai-command-center-v1.0

04-template-engine-v1.0

05-play-engine-v2.0

06-result-engine-v2.0

07-attribute-engine-v1.0

08-settlement-engine-v1.0

09-statistics-engine-v1.0

10-site-engine-v1.0

11-rule-engine-v1.0

12-data-generator-v1.0
```

---

# 一、模块目标

Admin Backend（后台管理系统）

负责：

```text
站点管理

开奖管理

玩法管理

模板管理

广告管理

统计管理

规则管理

AI管理

用户管理

系统管理
```

---

最终目标

管理员只需要：

```text
输入一句话
```

即可：

```text
生成网站

修改网站

维护网站

更新玩法

更新广告

发布上线
```

---

# 二、后台角色体系

支持：

```yaml
SuperAdmin
超级管理员

Admin
管理员

Editor
编辑

Operator
运营人员

Viewer
只读用户
```

---

# 三、权限系统

## SuperAdmin

权限：

```yaml
全部权限
```

包括：

```yaml
创建站点

删除站点

修改规则

管理AI

管理用户

系统设置
```

---

## Admin

权限：

```yaml
管理站点

管理玩法

管理开奖

管理广告
```

---

## Editor

权限：

```yaml
编辑内容

编辑广告

编辑模板
```

---

## Operator

权限：

```yaml
开奖维护

统计查看

数据修复
```

---

## Viewer

权限：

```yaml
只读
```

---

# 四、后台首页

Dashboard

---

显示：

```yaml
站点数量

玩法数量

广告数量

开奖数量

今日访问量

今日开奖状态
```

---

统计卡：

```yaml
总站点

总玩法

总开奖

总广告

总用户
```

---

# 五、后台菜单

```yaml
控制台

站点管理

开奖结果

玩法管理

模板管理

广告管理

栏目管理

统计中心

规则中心

AI控制中心

任务中心

用户中心

系统设置
```

---

# 六、站点管理

路径：

```yaml
/admin/sites
```

---

支持：

```yaml
创建网站

复制网站

删除网站

暂停网站

发布网站

修改网站
```

---

站点列表：

```yaml
site_id

site_name

domain

template

status

created_at
```

---

状态：

```yaml
draft

testing

published

disabled
```

---

# 七、创建网站界面

支持：

```yaml
站点名称

域名

采种

模板

玩法数量

广告数量
```

---

采种：

```yaml
香港

澳门

双采种
```

---

默认：

```yaml
50玩法

10广告

3栏目
```

---

点击：

```yaml
生成网站
```

---

调用：

```yaml
Site Engine

Data Generator
```

---

# 八、开奖结果管理

路径：

```yaml
/admin/results
```

---

支持：

```yaml
新增开奖

修改开奖

删除开奖

导入开奖

开奖审核
```

---

来源：

## 方式1

人工录入

---

字段：

```yaml
期号

开奖时间

7个号码
```

---

规则：

```yaml
前6个号码=平码

最后1个号码=特码
```

---

## 方式2

接口同步

预留

---

# 九、开奖结果录入页面

录入：

```yaml
lottery_type

period

numbers
```

---

示例：

```yaml
HK

2026001

01
13
25
37
41
46

49
```

---

提交后：

自动执行：

```text
属性计算
↓

结算
↓

统计
↓

网站更新
```

---

# 十、玩法管理

路径：

```yaml
/admin/plays
```

---

支持：

```yaml
新增玩法

编辑玩法

停用玩法

删除玩法

复制玩法
```

---

显示：

```yaml
玩法名称

玩法类型

采种

状态

命中率
```

---

# 十一、玩法编辑器

支持：

```yaml
名称

规则

模板

统计规则

显示规则
```

---

例如：

```yaml
平特一肖
```

---

编辑：

```yaml
三期三肖
```

---

自动更新：

```yaml
Rule Engine
```

---

# 十二、模板管理

路径：

```yaml
/admin/templates
```

---

分为：

```yaml
网站模板

模块模板

广告模板
```

---

支持：

```yaml
新增

编辑

复制

删除

预览
```

---

# 十三、可视化模板编辑器

支持：

```yaml
拖拽布局

实时预览

AI生成样式

CSS编辑
```

---

AI命令：

```text
把当前模板改成科技蓝
```

---

自动执行。

---

# 十四、广告管理

路径：

```yaml
/admin/ads
```

---

支持：

```yaml
新增广告

编辑广告

删除广告

统计广告
```

---

广告类型：

```yaml
图片

文字

按钮

HTML
```

---

# 十五、栏目管理

路径：

```yaml
/admin/channels
```

---

默认：

```yaml
高手榜

历史回顾

资料中心
```

---

支持：

```yaml
新增栏目

修改栏目

删除栏目
```

---

# 十六、统计中心

路径：

```yaml
/admin/statistics
```

---

显示：

```yaml
命中率

排行榜

属性统计

访问统计

广告统计
```

---

支持：

```yaml
导出Excel

导出CSV
```

---

# 十七、规则中心

路径：

```yaml
/admin/rules
```

---

显示：

```yaml
规则名称

规则类型

状态

版本
```

---

支持：

```yaml
新增规则

修改规则

停用规则

回滚规则
```

---

# 十八、AI控制中心

路径：

```yaml
/admin/ai
```

---

核心模块

---

输入框：

```text
自然语言命令
```

---

例如：

```text
生成一个澳门站
```

---

执行：

```text
Site Engine
```

---

例如：

```text
新增玩法

五行三肖
```

---

执行：

```text
Rule Engine
```

---

例如：

```text
把首页改成红色风格
```

---

执行：

```text
Template Engine
```

---

# 十九、AI执行记录

显示：

```yaml
任务ID

执行时间

执行内容

执行状态

执行结果
```

---

状态：

```yaml
running

success

failed
```

---

支持：

```yaml
查看日志

回滚
```

---

# 二十、任务中心

路径：

```yaml
/admin/tasks
```

---

显示：

```yaml
开奖任务

统计任务

AI任务

部署任务

同步任务
```

---

支持：

```yaml
重试

停止

查看日志
```

---

# 二十一、用户管理

路径：

```yaml
/admin/users
```

---

支持：

```yaml
新增用户

删除用户

禁用用户

角色管理
```

---

字段：

```yaml
用户名

邮箱

角色

状态
```

---

# 二十二、系统设置

路径：

```yaml
/admin/settings
```

---

配置：

```yaml
系统名称

默认模板

默认玩法数

默认广告数

缓存配置
```

---

# 二十三、开奖时间管理（新增）

路径：

```yaml
/admin/lottery-schedule
```

---

澳门：

固定：

```yaml
21:30
```

---

香港：

支持录入：

```yaml
开奖期号

开奖时间
```

---

例如：

```yaml
2026001

2026-01-03 21:30
```

---

系统自动生成：

```yaml
开奖计划
```

---

# 二十四、生肖管理（新增）

路径：

```yaml
/admin/zodiac-year
```

---

作用：

管理每年生肖号码表

---

例如：

```yaml
2026

马:
01
13
25
37
49
```

---

保存：

```yaml
year

zodiac_map
```

---

用于：

```yaml
Attribute Engine
```

---

# 二十五、五行管理（新增）

路径：

```yaml
/admin/wuxing-year
```

---

作用：

管理年度五行配置

---

例如：

```yaml
2026

金:
01
02
...
```

---

保存：

```yaml
year

wuxing_map
```

---

用于：

```yaml
Attribute Engine
```

---

# 二十六、数据修复中心

路径：

```yaml
/admin/data-repair
```

---

支持：

```yaml
重算属性

重算结算

重算统计

重建排行榜

刷新缓存
```

---

例如：

```text
修复2026015期开奖
```

---

执行：

```text
结果引擎

↓

属性引擎

↓

结算引擎

↓

统计引擎
```

---

# 二十七、版本中心

路径：

```yaml
/admin/versions
```

---

支持：

```yaml
站点版本

玩法版本

规则版本

模板版本
```

---

支持：

```yaml
查看

比较

回滚
```

---

# 二十八、数据库表

## admin_user

```yaml
id

username

password_hash

email

role

status

created_at
```

---

## admin_role

```yaml
id

name

permissions
```

---

## admin_log

```yaml
id

user_id

action

content

created_at
```

---

## ai_task

```yaml
id

command

status

result

created_at
```

---

## lottery_schedule

```yaml
id

lottery_type

period

open_time
```

---

# 二十九、操作日志

所有后台操作必须记录。

---

记录：

```yaml
登录

新增

修改

删除

回滚

发布
```

---

保存：

```yaml
永久保存
```

---

# 三十、开发强制规则

规则1

```yaml
所有操作必须记录日志
```

---

规则2

```yaml
删除操作必须支持恢复
```

---

规则3

```yaml
开奖结果修改必须触发重算
```

---

规则4

```yaml
AI操作必须支持回滚
```

---

规则5

```yaml
规则修改必须版本化
```

---

规则6

```yaml
生肖配置必须按年度管理
```

---

规则7

```yaml
五行配置必须按年度管理
```

---

规则8

```yaml
香港开奖计划必须可配置
```

---

# 三十一、V1开发范围

必须实现：

```text
后台登录

权限系统

站点管理

开奖结果管理

玩法管理

模板管理

广告管理

栏目管理

统计中心

规则中心

AI控制中心

任务中心

用户管理

系统设置

开奖时间管理

生肖管理

五行管理

数据修复中心

版本中心
```

---

# Admin Backend 最终目标

管理员进入后台后只需要输入：

```text
生成一个香港站

科技蓝风格

50个玩法

10个广告
```

或者：

```text
把首页改成红色

新增五行三肖玩法

重新计算最近30期统计
```

系统自动完成：

```text
规则生成
↓

模板修改
↓

数据生成
↓

统计更新
↓

网站发布
```

实现：

```text
AI后台

AI运营

AI维护

AI建站
```

---


