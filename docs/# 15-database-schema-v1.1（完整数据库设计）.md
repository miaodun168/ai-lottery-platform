# 15-database-schema-v1.1（完整数据库设计修正版）

## 文档状态

```text
版本：v1.1
状态：冻结版
优先级：P0
数据库：PostgreSQL 16+
缓存：Redis 7+
ORM：Prisma
字符集：UTF8
时区：Asia/Shanghai
```

---

# 一、数据库设计原则

## 核心业务规则

```text
规则1：
全年预测一次生成

规则2：
开奖后只结算

规则3：
不允许开奖后生成预测

规则4：
香港澳门独立数据

规则5：
预测采用批次管理

规则6：
支持历史回滚

规则7：
支持多站点

规则8：
支持多模板

规则9：
支持AI管理

规则10：
支持无限扩展玩法
```

---

# 二、ER图核心结构

```text
site
│
├── play
│    │
│    ├── prediction_batch
│    │      │
│    │      └── prediction_record
│    │
│    └── statistics_summary
│
├── result
│    │
│    ├── result_number
│    └── result_attribute
│
├── page
├── component
├── ad
│
└── ai_task
```

---

# 三、站点表

## site

```sql
CREATE TABLE site (

 id BIGSERIAL PRIMARY KEY,

 name VARCHAR(200) NOT NULL,

 code VARCHAR(100) UNIQUE,

 domain VARCHAR(255),

 theme_id BIGINT,

 layout_id BIGINT,

 status VARCHAR(30),

 description TEXT,

 created_at TIMESTAMP,

 updated_at TIMESTAMP

);
```

---

# 四、采种表

## lottery_type

```sql
CREATE TABLE lottery_type (

 id BIGSERIAL PRIMARY KEY,

 code VARCHAR(30),

 name VARCHAR(50),

 draw_time VARCHAR(50),

 status BOOLEAN,

 created_at TIMESTAMP

);
```

数据：

```text
hk      香港
macau   澳门
```

---

# 五、香港开奖日历

## hk_calendar

```sql
CREATE TABLE hk_calendar (

 id BIGSERIAL PRIMARY KEY,

 year INT,

 period VARCHAR(20),

 draw_date DATE,

 draw_time TIME,

 status BOOLEAN

);
```

---

# 六、玩法表

## play

```sql
CREATE TABLE play (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 rule_code VARCHAR(20),

 name VARCHAR(200),

 alias_name VARCHAR(200),

 group_size INT DEFAULT 1,

 status VARCHAR(20),

 sort_no INT,

 created_at TIMESTAMP,

 updated_at TIMESTAMP

);
```

---

# 七、玩法规则表

## play_rule

```sql
CREATE TABLE play_rule (

 id BIGSERIAL PRIMARY KEY,

 rule_code VARCHAR(20),

 rule_name VARCHAR(200),

 dsl TEXT,

 version VARCHAR(20),

 status BOOLEAN,

 created_at TIMESTAMP

);
```

---

# 八、预测批次表

## prediction_batch

```sql
CREATE TABLE prediction_batch (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 year INT,

 batch_no VARCHAR(100),

 play_count INT,

 record_count INT,

 is_active BOOLEAN,

 created_by BIGINT,

 created_at TIMESTAMP

);
```

---

# 九、预测记录表

## prediction_record

```sql
CREATE TABLE prediction_record (

 id BIGSERIAL PRIMARY KEY,

 batch_id BIGINT,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 play_id BIGINT,

 year INT,

 period VARCHAR(20),

 group_id BIGINT,

 prediction_content TEXT,

 status VARCHAR(20),

 created_at TIMESTAMP
);
```

---

## 唯一约束

```sql
CREATE UNIQUE INDEX idx_prediction_unique
ON prediction_record
(
 batch_id,
 play_id,
 period
);
```

---

# 十、开奖结果表

## result

```sql
CREATE TABLE result (

 id BIGSERIAL PRIMARY KEY,

 lottery_type VARCHAR(20),

 period VARCHAR(20),

 draw_date TIMESTAMP,

 input_type VARCHAR(20),

 status VARCHAR(20),

 created_at TIMESTAMP
);
```

---

# 十一、开奖号码表

## result_number

```sql
CREATE TABLE result_number (

 id BIGSERIAL PRIMARY KEY,

 result_id BIGINT,

 seq_no INT,

 number_value INT,

 zodiac VARCHAR(20),

 wave_color VARCHAR(20),

 element VARCHAR(20),

 created_at TIMESTAMP
);
```

---

规则：

```text
1~6 = 平码

7 = 特码
```

---

# 十二、开奖属性表

## result_attribute

```sql
CREATE TABLE result_attribute (

 id BIGSERIAL PRIMARY KEY,

 result_id BIGINT,

 attribute_code VARCHAR(50),

 attribute_value VARCHAR(100)
);
```

---

# 十三、结算记录表

## settlement_record

```sql
CREATE TABLE settlement_record (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 play_id BIGINT,

 period VARCHAR(20),

 prediction_id BIGINT,

 hit BOOLEAN,

 status VARCHAR(20),

 created_at TIMESTAMP
);
```

---

# 十四、统计汇总表

## statistics_summary

```sql
CREATE TABLE statistics_summary (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 play_id BIGINT,

 year INT,

 total_count INT,

 hit_count INT,

 miss_count INT,

 hit_rate NUMERIC(8,2),

 current_hit_streak INT,

 current_miss_streak INT,

 best_hit_streak INT,

 best_miss_streak INT,

 hidden_count INT,

 updating_count INT,

 updated_at TIMESTAMP
);
```

---

# 十五、统计周期表

## statistics_period

```sql
CREATE TABLE statistics_period (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 lottery_type VARCHAR(20),

 play_id BIGINT,

 period_type VARCHAR(20),

 hit_count INT,

 miss_count INT,

 hit_rate NUMERIC(8,2),

 updated_at TIMESTAMP
);
```

---

# 十六、属性库表

## attribute_library

```sql
CREATE TABLE attribute_library (

 id BIGSERIAL PRIMARY KEY,

 attribute_type VARCHAR(50),

 attribute_name VARCHAR(100),

 attribute_value TEXT,

 year INT,

 is_dynamic BOOLEAN,

 created_at TIMESTAMP
);
```

---

支持：

```text
生肖
五行
波色
单双
大小
左右
天地
家禽野兽
文武
阴阳
前后
合数
段位
尾数
头数
```

---

# 十七、广告表

## ad

```sql
CREATE TABLE ad (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 title VARCHAR(200),

 image_url TEXT,

 target_url TEXT,

 sort_no INT,

 status BOOLEAN,

 created_at TIMESTAMP
);
```

---

# 十八、页面表

## page

```sql
CREATE TABLE page (

 id BIGSERIAL PRIMARY KEY,

 site_id BIGINT,

 name VARCHAR(200),

 slug VARCHAR(200),

 page_type VARCHAR(50),

 seo_title VARCHAR(255),

 seo_keywords TEXT,

 seo_description TEXT,

 created_at TIMESTAMP
);
```

---

# 十九、组件表

## component

```sql
CREATE TABLE component (

 id BIGSERIAL PRIMARY KEY,

 component_code VARCHAR(100),

 component_name VARCHAR(200),

 component_type VARCHAR(100),

 config_json JSONB,

 created_at TIMESTAMP
);
```

---

# 二十、页面组件关联

## page_component

```sql
CREATE TABLE page_component (

 id BIGSERIAL PRIMARY KEY,

 page_id BIGINT,

 component_id BIGINT,

 sort_no INT,

 config_json JSONB
);
```

---

# 二十一、主题表

## theme

```sql
CREATE TABLE theme (

 id BIGSERIAL PRIMARY KEY,

 theme_code VARCHAR(100),

 theme_name VARCHAR(200),

 config_json JSONB,

 created_at TIMESTAMP
);
```

---

# 二十二、布局表

## layout

```sql
CREATE TABLE layout (

 id BIGSERIAL PRIMARY KEY,

 layout_code VARCHAR(100),

 layout_name VARCHAR(200),

 config_json JSONB,

 created_at TIMESTAMP
);
```

---

# 二十三、AI任务表

## ai_task

```sql
CREATE TABLE ai_task (

 id BIGSERIAL PRIMARY KEY,

 task_type VARCHAR(100),

 command_text TEXT,

 status VARCHAR(30),

 result_json JSONB,

 created_at TIMESTAMP,

 finished_at TIMESTAMP
);
```

---

# 二十四、后台用户表

## admin_user

```sql
CREATE TABLE admin_user (

 id BIGSERIAL PRIMARY KEY,

 username VARCHAR(100),

 password_hash VARCHAR(255),

 role VARCHAR(50),

 status BOOLEAN,

 created_at TIMESTAMP
);
```

---

# 二十五、系统配置表

## system_setting

```sql
CREATE TABLE system_setting (

 id BIGSERIAL PRIMARY KEY,

 setting_key VARCHAR(100),

 setting_value TEXT,

 updated_at TIMESTAMP
);
```

---

默认配置：

```json
{
  "miss_hide_limit":3,
  "show_updating":false,
  "updating_count":2,
  "enable_ai":true
}
```

---

# 二十六、日志表

## operation_log

```sql
CREATE TABLE operation_log (

 id BIGSERIAL PRIMARY KEY,

 user_id BIGINT,

 action VARCHAR(200),

 target_type VARCHAR(100),

 target_id BIGINT,

 detail_json JSONB,

 created_at TIMESTAMP
);
```

---

# 二十七、索引设计

## 高频索引

```sql
CREATE INDEX idx_prediction_play_period
ON prediction_record(play_id,period);

CREATE INDEX idx_result_period
ON result(period);

CREATE INDEX idx_statistics_play
ON statistics_summary(play_id);

CREATE INDEX idx_settlement_play_period
ON settlement_record(play_id,period);

CREATE INDEX idx_ai_task_status
ON ai_task(status);
```

---

# 二十八、Redis缓存设计

## Key结构

```text
play:{id}:statistics

play:{id}:last10

play:{id}:last30

play:{id}:last100

site:{id}:homepage

ranking:hk

ranking:macau
```

---

# 二十九、数据库容量估算

单站：

```text
50玩法

366期

≈18300预测记录
```

---

100站：

```text
≈183万 prediction_record
```

---

完全可支撑 PostgreSQL。

---

# 三十、最终冻结数据库架构

```text
Site Engine
     ↓
Play Engine
     ↓
Prediction Batch
     ↓
Prediction Record
     ↓
Result Engine
     ↓
Settlement Engine
     ↓
Statistics Engine
     ↓
Frontend
```

---

 
