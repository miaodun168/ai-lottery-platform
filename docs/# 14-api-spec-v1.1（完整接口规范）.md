下面这版已经基于：

```text
00-global-business-rules-v1.1
08-settlement-engine-v1.1
09-statistics-engine-v1.1
12-data-generator-v1.1
13-admin-backend-v1.0
```

重新修正。

重点增加：

✅ 香港澳门双采种
✅ 全年预测生成接口
✅ Prediction Batch接口
✅ 重新生成接口
✅ AI指令接口
✅ 网站生成接口
✅ 开奖录入接口
✅ 统计接口
✅ 模板接口
✅ 主题接口
✅ 布局接口

达到 Claude Code 可直接开发级别。

---

# 14-api-spec-v1.1（完整接口规范）

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

协议

```text
REST API

JSON

JWT Auth
```

Base URL

```text
/api/v1
```

---

# 一、统一返回格式

成功：

```json
{
  "code":0,
  "message":"success",
  "data":{}
}
```

失败：

```json
{
  "code":500,
  "message":"error"
}
```

---

# 二、认证接口

## 登录

```http
POST /auth/login
```

Request

```json
{
  "username":"admin",
  "password":"123456"
}
```

Response

```json
{
  "token":"jwt_token"
}
```

---

## 获取当前用户

```http
GET /auth/profile
```

---

# 三、采种接口

## 获取采种列表

```http
GET /lottery/types
```

Response

```json
[
  {
    "code":"hk",
    "name":"香港"
  },
  {
    "code":"macau",
    "name":"澳门"
  }
]
```

---

# 四、网站接口

## 创建网站

```http
POST /sites
```

Request

```json
{
  "name":"香港红金站",

  "theme":"theme_red_gold",

  "layout":"layout_default",

  "lottery_types":[
    "hk",
    "macau"
  ]
}
```

---

## 网站列表

```http
GET /sites
```

---

## 网站详情

```http
GET /sites/{id}
```

---

## 删除网站

```http
DELETE /sites/{id}
```

---

## 发布网站

```http
POST /sites/{id}/publish
```

---

# 五、模板接口

## 模板列表

```http
GET /templates
```

参数：

```text
site

play

ad

page
```

---

## 创建模板

```http
POST /templates
```

---

## 更新模板

```http
PUT /templates/{id}
```

---

# 六、主题接口

## 获取主题

```http
GET /themes
```

---

## 应用主题

```http
POST /sites/{id}/theme
```

Request

```json
{
  "theme_id":1
}
```

---

# 七、布局接口

## 获取布局

```http
GET /layouts
```

---

## 应用布局

```http
POST /sites/{id}/layout
```

---

# 八、玩法接口

## 获取玩法列表

```http
GET /plays
```

参数：

```text
site_id

lottery_type
```

---

## 创建玩法

```http
POST /plays
```

Request

```json
{
  "site_id":1,

  "lottery_type":"hk",

  "rule_code":"20001",

  "name":"平特一肖"
}
```

---

创建后：

```text
自动生成全年预测
```

---

## 更新玩法

```http
PUT /plays/{id}
```

---

## 删除玩法

```http
DELETE /plays/{id}
```

---

## 重新生成玩法数据

```http
POST /plays/{id}/regenerate
```

---

# 九、开奖接口

## 开奖录入

```http
POST /results
```

Request

```json
{
  "lottery_type":"macau",

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

系统自动：

```text
生成属性

自动结算

自动统计
```

---

## 开奖列表

```http
GET /results
```

---

## 开奖详情

```http
GET /results/{id}
```

---

## 修改开奖结果

```http
PUT /results/{id}
```

---

修改后：

```text
自动重新结算
自动重新统计
```

---

# 十、属性接口

## 获取属性

```http
GET /attributes
```

支持：

```text
生肖

波色

五行

单双

大小

左右

天地

家禽野兽
```

---

## 获取属性详情

```http
GET /attributes/{id}
```

---

# 十一、预测接口

## 获取预测列表

```http
GET /predictions
```

参数：

```text
site_id

play_id

lottery_type

year

period
```

---

## 获取单期预测

```http
GET /predictions/{id}
```

---

## 获取全年预测

```http
GET /predictions/year
```

参数：

```text
site_id

play_id

year
```

---

# 十二、预测批次接口

## 获取批次列表

```http
GET /prediction-batches
```

---

## 获取批次详情

```http
GET /prediction-batches/{id}
```

---

## 回滚批次

```http
POST /prediction-batches/{id}/rollback
```

---

# 十三、数据生成接口

## 生成全年数据

```http
POST /generator/year
```

Request

```json
{
  "site_id":1,

  "lottery_type":"hk",

  "year":2026
}
```

---

## 生成单玩法数据

```http
POST /generator/play
```

---

## 重建站点数据

```http
POST /generator/site
```

---

## 重建历史数据

```http
POST /generator/rebuild
```

---

# 十四、结算接口

## 单期结算

```http
POST /settlement/period
```

---

## 批量结算

```http
POST /settlement/batch
```

---

## 全年重算

```http
POST /settlement/year
```

---

# 十五、统计接口

## 获取统计

```http
GET /statistics
```

参数：

```text
site_id

play_id

lottery_type
```

---

返回：

```json
{
  "total_rate":63.2,

  "last_10_rate":70,

  "last_30_rate":65,

  "last_100_rate":61
}
```

---

## 排行榜

```http
GET /statistics/ranking
```

---

## 热门玩法

```http
GET /statistics/hot
```

---

## 趋势图

```http
GET /statistics/trend
```

---

# 十六、广告接口

## 广告列表

```http
GET /ads
```

---

## 创建广告

```http
POST /ads
```

---

## AI生成广告

```http
POST /ads/ai-generate
```

---

# 十七、页面接口

## 页面列表

```http
GET /pages
```

---

## 创建页面

```http
POST /pages
```

---

## 更新页面

```http
PUT /pages/{id}
```

---

# 十八、组件接口

## 获取组件库

```http
GET /components
```

---

## 创建组件

```http
POST /components
```

---

# 十九、AI接口

## AI指令执行

```http
POST /ai/command
```

Request

```json
{
  "command":"新增20个平特一肖"
}
```

---

Response

```json
{
  "task_id":"123"
}
```

---

## 查询AI任务

```http
GET /ai/tasks/{id}
```

---

## AI生成网站

```http
POST /ai/site-generate
```

---

## AI修改网站

```http
POST /ai/site-update
```

---

## AI生成玩法

```http
POST /ai/play-generate
```

---

# 二十、日志接口

## 操作日志

```http
GET /logs
```

---

## AI日志

```http
GET /logs/ai
```

---

## 开奖日志

```http
GET /logs/result
```

---

# 二十一、部署接口

## 部署站点

```http
POST /deploy/site
```

---

## 获取部署状态

```http
GET /deploy/status
```

---

## 获取站点域名

```http
GET /deploy/domain
```

---

# 二十二、后台配置接口

## 系统配置

```http
GET /settings
```

---

## 更新配置

```http
PUT /settings
```

---

重点配置：

```json
{
  "miss_hide_limit":3,

  "show_updating":false,

  "updating_count":2
}
```

---

# 二十三、Webhook（预留）

## 开奖推送

```http
POST /webhook/result
```

---

## AI任务推送

```http
POST /webhook/ai
```

---

# 二十四、权限规范

角色：

```text
SuperAdmin

Admin

Editor

Viewer
```

---

权限：

```text
RBAC
```

---

AI接口：

```text
Admin以上
```

---

开奖接口：

```text
Editor以上
```

---

# 二十五、最终接口架构

```text
Admin Backend

↓

API Gateway

↓

Auth

↓

Site Engine

↓

Play Engine

↓

Result Engine

↓

Settlement Engine

↓

Statistics Engine

↓

Database
```

---
 
