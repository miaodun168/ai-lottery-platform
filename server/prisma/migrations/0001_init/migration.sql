-- AI Lottery Platform - Migration v0001_init
-- Database: PostgreSQL 16+
-- Generated: Phase 1

-- ─── 站点表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "site" (
    "id"          BIGSERIAL PRIMARY KEY,
    "name"        VARCHAR(200) NOT NULL,
    "code"        VARCHAR(100) UNIQUE,
    "domain"      VARCHAR(255),
    "theme_id"    BIGINT,
    "layout_id"   BIGINT,
    "status"      VARCHAR(30),
    "description" TEXT,
    "created_at"  TIMESTAMP,
    "updated_at"  TIMESTAMP
);

-- ─── 采种表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "lottery_type" (
    "id"         BIGSERIAL PRIMARY KEY,
    "code"       VARCHAR(30),
    "name"       VARCHAR(50),
    "draw_time"  VARCHAR(50),
    "status"     BOOLEAN,
    "created_at" TIMESTAMP
);

-- ─── 香港开奖日历 ─────────────────────────────────────────────────────────────

CREATE TABLE "hk_calendar" (
    "id"         BIGSERIAL PRIMARY KEY,
    "year"       INTEGER NOT NULL,
    "period_no"  VARCHAR(20) NOT NULL,
    "draw_date"  DATE NOT NULL,
    "draw_time"  TIMESTAMP NOT NULL,
    "status"     VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP
);

CREATE UNIQUE INDEX "hk_calendar_year_period_no_key"
    ON "hk_calendar" ("year", "period_no");

-- ─── 玩法表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "play" (
    "id"           BIGSERIAL PRIMARY KEY,
    "site_id"      BIGINT,
    "lottery_type" VARCHAR(20),
    "rule_code"    VARCHAR(20),
    "name"         VARCHAR(200),
    "alias_name"   VARCHAR(200),
    "group_size"   INTEGER DEFAULT 1,
    "status"       VARCHAR(20),
    "sort_no"      INTEGER,
    "created_at"   TIMESTAMP,
    "updated_at"   TIMESTAMP
);

-- ─── 玩法规则表 ───────────────────────────────────────────────────────────────

CREATE TABLE "play_rule" (
    "id"         BIGSERIAL PRIMARY KEY,
    "rule_code"  VARCHAR(20),
    "rule_name"  VARCHAR(200),
    "dsl"        TEXT,
    "version"    VARCHAR(20),
    "status"     BOOLEAN,
    "created_at" TIMESTAMP
);

-- ─── 预测批次表 ───────────────────────────────────────────────────────────────

CREATE TABLE "prediction_batch" (
    "id"           BIGSERIAL PRIMARY KEY,
    "site_id"      BIGINT,
    "lottery_type" VARCHAR(20),
    "year"         INTEGER,
    "batch_no"     VARCHAR(100),
    "play_count"   INTEGER,
    "record_count" INTEGER,
    "is_active"    BOOLEAN,
    "created_by"   BIGINT,
    "created_at"   TIMESTAMP
);

-- ─── 预测记录表 ───────────────────────────────────────────────────────────────

CREATE TABLE "prediction_record" (
    "id"                 BIGSERIAL PRIMARY KEY,
    "batch_id"           BIGINT,
    "site_id"            BIGINT,
    "lottery_type"       VARCHAR(20),
    "play_id"            BIGINT,
    "year"               INTEGER,
    "period"             VARCHAR(20),
    "group_id"           BIGINT,
    "prediction_content" TEXT,
    "status"             VARCHAR(20),
    "created_at"         TIMESTAMP
);

CREATE UNIQUE INDEX "idx_prediction_unique"
    ON "prediction_record" ("batch_id", "play_id", "period");

CREATE INDEX "idx_prediction_play_period"
    ON "prediction_record" ("play_id", "period");

-- ─── 开奖结果表 ───────────────────────────────────────────────────────────────

CREATE TABLE "result" (
    "id"           BIGSERIAL PRIMARY KEY,
    "lottery_type" VARCHAR(20),
    "period"       VARCHAR(20),
    "draw_date"    TIMESTAMP,
    "input_type"   VARCHAR(20),
    "status"       VARCHAR(20),
    "created_at"   TIMESTAMP
);

CREATE INDEX "idx_result_period"
    ON "result" ("period");

-- ─── 开奖号码表（seq_no: 1~6=平码 7=特码）──────────────────────────────────

CREATE TABLE "result_number" (
    "id"           BIGSERIAL PRIMARY KEY,
    "result_id"    BIGINT,
    "seq_no"       INTEGER,
    "number_value" INTEGER,
    "zodiac"       VARCHAR(20),
    "wave_color"   VARCHAR(20),
    "element"      VARCHAR(20),
    "created_at"   TIMESTAMP
);

-- ─── 开奖属性表 ───────────────────────────────────────────────────────────────

CREATE TABLE "result_attribute" (
    "id"              BIGSERIAL PRIMARY KEY,
    "result_id"       BIGINT,
    "attribute_code"  VARCHAR(50),
    "attribute_value" VARCHAR(100)
);

-- ─── 结算记录表 ───────────────────────────────────────────────────────────────

CREATE TABLE "settlement_record" (
    "id"            BIGSERIAL PRIMARY KEY,
    "site_id"       BIGINT,
    "lottery_type"  VARCHAR(20),
    "play_id"       BIGINT,
    "period"        VARCHAR(20),
    "prediction_id" BIGINT,
    "hit"           BOOLEAN,
    "status"        VARCHAR(20),
    "created_at"    TIMESTAMP
);

CREATE INDEX "idx_settlement_play_period"
    ON "settlement_record" ("play_id", "period");

-- ─── 统计汇总表 ───────────────────────────────────────────────────────────────

CREATE TABLE "statistics_summary" (
    "id"                  BIGSERIAL PRIMARY KEY,
    "site_id"             BIGINT,
    "lottery_type"        VARCHAR(20),
    "play_id"             BIGINT,
    "year"                INTEGER,
    "total_count"         INTEGER,
    "hit_count"           INTEGER,
    "miss_count"          INTEGER,
    "hit_rate"            NUMERIC(8, 2),
    "current_hit_streak"  INTEGER,
    "current_miss_streak" INTEGER,
    "best_hit_streak"     INTEGER,
    "best_miss_streak"    INTEGER,
    "hidden_count"        INTEGER,
    "updating_count"      INTEGER,
    "updated_at"          TIMESTAMP
);

CREATE INDEX "idx_statistics_play"
    ON "statistics_summary" ("play_id");

-- ─── 统计周期表 ───────────────────────────────────────────────────────────────

CREATE TABLE "statistics_period" (
    "id"           BIGSERIAL PRIMARY KEY,
    "site_id"      BIGINT,
    "lottery_type" VARCHAR(20),
    "play_id"      BIGINT,
    "period_type"  VARCHAR(20),
    "hit_count"    INTEGER,
    "miss_count"   INTEGER,
    "hit_rate"     NUMERIC(8, 2),
    "updated_at"   TIMESTAMP
);

-- ─── 属性库表 ─────────────────────────────────────────────────────────────────

CREATE TABLE "attribute_library" (
    "id"              BIGSERIAL PRIMARY KEY,
    "attribute_type"  VARCHAR(50),
    "attribute_name"  VARCHAR(100),
    "attribute_value" TEXT,
    "year"            INTEGER,
    "is_dynamic"      BOOLEAN,
    "created_at"      TIMESTAMP
);

-- ─── 广告表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "ad" (
    "id"         BIGSERIAL PRIMARY KEY,
    "site_id"    BIGINT,
    "title"      VARCHAR(200),
    "image_url"  TEXT,
    "target_url" TEXT,
    "sort_no"    INTEGER,
    "status"     BOOLEAN,
    "created_at" TIMESTAMP
);

-- ─── 页面表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "page" (
    "id"              BIGSERIAL PRIMARY KEY,
    "site_id"         BIGINT,
    "name"            VARCHAR(200),
    "slug"            VARCHAR(200),
    "page_type"       VARCHAR(50),
    "seo_title"       VARCHAR(255),
    "seo_keywords"    TEXT,
    "seo_description" TEXT,
    "created_at"      TIMESTAMP
);

-- ─── 组件表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "component" (
    "id"             BIGSERIAL PRIMARY KEY,
    "component_code" VARCHAR(100),
    "component_name" VARCHAR(200),
    "component_type" VARCHAR(100),
    "config_json"    JSONB,
    "created_at"     TIMESTAMP
);

-- ─── 页面组件关联表 ───────────────────────────────────────────────────────────

CREATE TABLE "page_component" (
    "id"           BIGSERIAL PRIMARY KEY,
    "page_id"      BIGINT,
    "component_id" BIGINT,
    "sort_no"      INTEGER,
    "config_json"  JSONB
);

-- ─── 主题表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "theme" (
    "id"          BIGSERIAL PRIMARY KEY,
    "theme_code"  VARCHAR(100),
    "theme_name"  VARCHAR(200),
    "config_json" JSONB,
    "created_at"  TIMESTAMP
);

-- ─── 布局表 ──────────────────────────────────────────────────────────────────

CREATE TABLE "layout" (
    "id"          BIGSERIAL PRIMARY KEY,
    "layout_code" VARCHAR(100),
    "layout_name" VARCHAR(200),
    "config_json" JSONB,
    "created_at"  TIMESTAMP
);

-- ─── AI任务表 ─────────────────────────────────────────────────────────────────

CREATE TABLE "ai_task" (
    "id"           BIGSERIAL PRIMARY KEY,
    "task_type"    VARCHAR(100),
    "command_text" TEXT,
    "status"       VARCHAR(30),
    "result_json"  JSONB,
    "created_at"   TIMESTAMP,
    "finished_at"  TIMESTAMP
);

CREATE INDEX "idx_ai_task_status"
    ON "ai_task" ("status");

-- ─── 后台用户表 ───────────────────────────────────────────────────────────────

CREATE TABLE "admin_user" (
    "id"            BIGSERIAL PRIMARY KEY,
    "username"      VARCHAR(100),
    "password_hash" VARCHAR(255),
    "role"          VARCHAR(50),
    "status"        BOOLEAN,
    "created_at"    TIMESTAMP
);

-- ─── 系统配置表 ───────────────────────────────────────────────────────────────

CREATE TABLE "system_setting" (
    "id"            BIGSERIAL PRIMARY KEY,
    "setting_key"   VARCHAR(100) UNIQUE,
    "setting_value" TEXT,
    "updated_at"    TIMESTAMP
);

-- ─── 操作日志表 ───────────────────────────────────────────────────────────────

CREATE TABLE "operation_log" (
    "id"          BIGSERIAL PRIMARY KEY,
    "user_id"     BIGINT,
    "action"      VARCHAR(200),
    "target_type" VARCHAR(100),
    "target_id"   BIGINT,
    "detail_json" JSONB,
    "created_at"  TIMESTAMP
);
