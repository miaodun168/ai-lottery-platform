# 03-ai-command-center-v1.0（AI口令中心详细设计）

> 项目：AI自动建站与自动运维系统
> 模块：AI Command Center（AI口令中心）
> 版本：v1.0
> 状态：核心架构冻结版

---

# 一、模块定位

AI口令中心是整个系统的大脑。

所有操作最终统一转换为：

```text
自然语言
↓
AI解析
↓
标准命令
↓
任务执行
↓
结果反馈
```

最终目标：

```text
不会代码
不会后台操作

只会聊天

也能管理整个站群
```

例如：

```text
把财富阁首页改成红金风格
```

AI自动完成：

```text
识别网站

识别首页

识别红金风格

替换模板

更新样式

发布上线
```

---

# 二、AI架构

## 第一层

### 对话层

用户输入：

```text
生成一个新网站

名字：财富阁

风格：黑金

玩法：
平特一肖
三期三肖
大小中特
```

---

AI理解：

```json
{
  "intent":"create_site",
  "site_name":"财富阁",
  "theme":"black_gold",
  "plays":[
    "平特一肖",
    "三期三肖",
    "大小中特"
  ]
}
```

---

# 第二层

### 命令解析层

AI转为系统命令：

```json
{
  "action":"site.create",
  "params":{}
}
```

---

# 第三层

### 执行层

调用：

```text
Site Engine

Template Engine

Play Engine

Ad Engine
```

---

# 第四层

### 审计层

记录：

```yaml
operator:
command:
before:
after:
time:
```

支持回滚。

---

# 三、AI命令分类

---

# A 网站命令

---

## 创建网站

口令：

```text
创建一个网站

名字：聚宝阁

模板：red001
```

执行：

```yaml
site.create
```

---

## 删除网站

```text
删除聚宝阁
```

执行：

```yaml
site.delete
```

---

## 复制网站

```text
复制财富阁

生成财富阁2
```

执行：

```yaml
site.clone
```

---

## 修改网站

```text
把财富阁改成黑金风格
```

执行：

```yaml
site.update
```

---

# B 模板命令

---

## 替换网站模板

```text
把财富阁换成模板 red002
```

执行：

```yaml
template.replace
```

---

## 新建模板

```text
生成一个赛博朋克模板
```

执行：

```yaml
template.create
```

---

## 修改模板

```text
把顶部导航改成毛玻璃效果
```

执行：

```yaml
template.update
```

---

# C 板块命令

---

## 新增板块

```text
新增一个热门推荐板块
```

---

## 删除板块

```text
删除广告板块
```

---

## 调整顺序

```text
把热门推荐移动到顶部
```

---

# D 玩法命令

---

## 新增玩法

```text
新增玩法

名称：
三期三肖
```

执行：

```yaml
play.create
```

---

## 修改玩法

```text
把三期三肖改成五期三肖
```

执行：

```yaml
play.update
```

---

## 删除玩法

```text
删除三期三肖
```

---

## 批量新增

```text
生成20个生肖玩法
```

AI自动组合：

```text
平特一肖

二肖中特

三肖中特

三期三肖

五期三肖

六合肖

三合肖

...
```

---

# E 规则命令

---

## 新增规则

```text
新增玩法

风雨雷电中特
```

AI执行：

```yaml
rule.create
```

生成：

```yaml
属性:
风肖
雨肖
雷肖
电肖
```

玩法自动建立。

---

## 修改规则

```text
把大小中特改成特码玩法
```

---

# F 数据命令

---

## 导入历史开奖

```text
导入2024历史开奖
```

---

## 重新计算

```text
重新计算全部历史命中率
```

---

## 修复数据

```text
修复第2026150期数据
```

---

# G 开奖命令

---

## 手工开奖

```text
录入开奖结果

期号：
2026150

号码：

01
13
25
31
36
44
49
```

AI执行：

```yaml
lottery.create
```

---

## 修改开奖

```text
修改2026150期

特码49改为48
```

---

## 重新结算

```text
重新结算2026150期
```

---

# H 广告命令

---

## 生成广告

```text
生成一个红金风格广告
```

---

## 替换广告

```text
把首页广告改成黑金风格
```

---

## 批量广告

```text
生成20套广告
```

---

# I SEO命令

---

## 生成SEO

```text
为财富阁生成SEO
```

生成：

```text
title

keywords

description
```

---

## 批量SEO

```text
为全部网站重新生成SEO
```

---

# 四、AI命令执行流程

```text
用户输入
      ↓
AI识别意图
      ↓
解析参数
      ↓
生成任务
      ↓
权限检查
      ↓
执行引擎
      ↓
结果验证
      ↓
写入日志
      ↓
返回结果
```

---

# 五、任务系统

所有AI操作必须转成任务。

---

## Task

```yaml
id:

type:

status:

created_at:
```

---

状态：

```yaml
pending

running

success

failed

rollback
```

---

# 六、回滚机制

必须支持。

例如：

```text
把财富阁改成黑金风格
```

执行后发现不好看。

输入：

```text
回滚上一操作
```

系统：

```yaml
restore
```

恢复。

---

# 七、AI安全机制

---

## 高危操作确认

例如：

```text
删除网站
```

AI返回：

```text
确认删除网站：

财富阁

输入：

确认删除
```

才执行。

---

## 批量操作确认

例如：

```text
删除全部网站
```

必须二次确认。

---

# 八、AI上下文记忆

当前会话自动维护：

```yaml
current_site:

current_template:

current_play:
```

例如：

```text
打开财富阁
```

后续：

```text
换个模板
```

AI自动理解：

```text
财富阁
```

---

# 九、AI自动运维（V2）

未来支持：

---

## 自动更新开奖结果

```yaml
每天执行
```

---

## 自动更新玩法结果

```yaml
每天执行
```

---

## 自动更新广告

```yaml
每周执行
```

---

## 自动优化模板

```yaml
每月执行
```

---

# 十、AI命令标准格式（内部）

统一转换：

```json
{
  "action":"play.create",

  "target":"site",

  "site_id":"1",

  "params":{}
}
```

支持：

```json
site.*

template.*

block.*

play.*

rule.*

lottery.*

statistics.*

ad.*

seo.*

ai.*
```

---

# 十一、Claude Code开发要求

必须实现：

### Command Parser

```text
自然语言
→标准命令
```

---

### Task Queue

```text
任务队列
```

---

### Audit Log

```text
审计日志
```

---

### Rollback Engine

```text
回滚引擎
```

---

### Permission Engine

```text
权限引擎
```

---

# 十二、V1开发范围

优先实现：

```text
网站生成

模板替换

玩法管理

开奖录入

历史数据生成

广告生成

回滚机制
```

---

# 十三、V2开发范围

实现：

```text
自动运维

自动SEO

自动广告优化

自动模板优化

自动站群运营
```

---

# AI口令中心最终目标

管理员以后只需要聊天：

```text
生成一个新站

新增20个玩法

换个模板

重新生成历史数据

更新开奖结果

生成广告
```

系统自动完成全部后台操作，无需进入任何管理界面。
