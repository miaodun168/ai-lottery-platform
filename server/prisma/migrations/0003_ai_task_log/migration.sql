-- Phase 6: AI Task Log + AI Command Log Tables

-- ─── AI 任务执行日志（每个步骤一行）────────────────────────────────────────

CREATE TABLE "ai_task_log" (
    "id"          BIGSERIAL PRIMARY KEY,
    "task_id"     BIGINT NOT NULL,
    "step"        INTEGER NOT NULL,
    "action"      VARCHAR(100),
    "status"      VARCHAR(20),
    "message"     TEXT,
    "data_before" JSONB,
    "data_after"  JSONB,
    "duration_ms" INTEGER,
    "created_at"  TIMESTAMP
);

CREATE INDEX "idx_ai_task_log_task"
    ON "ai_task_log" ("task_id");

-- ─── AI 命令日志（每条自然语言命令一行）─────────────────────────────────────

CREATE TABLE "ai_command_log" (
    "id"         BIGSERIAL PRIMARY KEY,
    "site_id"    BIGINT,
    "user_id"    BIGINT,
    "command"    TEXT,
    "intent"     VARCHAR(100),
    "dsl"        JSONB,
    "task_id"    BIGINT,
    "status"     VARCHAR(20),
    "result"     JSONB,
    "created_at" TIMESTAMP
);

CREATE INDEX "idx_ai_command_log_site"
    ON "ai_command_log" ("site_id");
