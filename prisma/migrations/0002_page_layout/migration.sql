-- Phase 5.1: Page Layout DSL + Component Instance Tables

-- ─── 页面布局DSL表 ─────────────────────────────────────────────────────────────
-- 每个站点每种页面类型存一条激活的 DSL

CREATE TABLE "page_layout_dsl" (
    "id"          BIGSERIAL PRIMARY KEY,
    "site_id"     BIGINT NOT NULL,
    "page_type"   VARCHAR(50) NOT NULL,
    "dsl"         JSONB NOT NULL,
    "version"     INTEGER NOT NULL DEFAULT 1,
    "is_active"   BOOLEAN NOT NULL DEFAULT true,
    "created_by"  BIGINT,
    "created_at"  TIMESTAMP,
    "updated_at"  TIMESTAMP
);

CREATE UNIQUE INDEX "idx_page_layout_unique"
    ON "page_layout_dsl" ("site_id", "page_type");

-- ─── 站点组件实例表 ───────────────────────────────────────────────────────────
-- 首页每个 slot 对应一行，是拖拽/增删/排序的操作对象

CREATE TABLE "site_component_instance" (
    "id"             BIGSERIAL PRIMARY KEY,
    "site_id"        BIGINT NOT NULL,
    "page_type"      VARCHAR(50) NOT NULL,
    "component_type" VARCHAR(50) NOT NULL,
    "sort"           INTEGER NOT NULL DEFAULT 0,
    "visible"        BOOLEAN NOT NULL DEFAULT true,
    "template"       VARCHAR(50),
    "config_json"    JSONB,
    "play_index"     INTEGER,
    "ad_index"       INTEGER,
    "cat_index"      INTEGER,
    "is_fixed"       BOOLEAN NOT NULL DEFAULT false,
    "created_at"     TIMESTAMP,
    "updated_at"     TIMESTAMP
);

CREATE INDEX "idx_sci_site_page"
    ON "site_component_instance" ("site_id", "page_type");
