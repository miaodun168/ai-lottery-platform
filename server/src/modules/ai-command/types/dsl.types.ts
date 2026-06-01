import { IntentDomain, IntentAction, IntentParams } from './intent.types'

// ─── Command DSL（AI → Engine 的统一交换格式）────────────────────────────────

export interface CommandDsl {
  version:    '1.0'
  intent:     IntentAction
  domain:     IntentDomain
  site_id?:   string
  user_id?:   string
  params:     IntentParams
  execution_mode: 'auto' | 'preview'      // preview=生成方案等待确认
  requires_confirmation: boolean
  raw_command: string                      // 原始自然语言
  created_at:  string
}

// ─── 执行结果 ──────────────────────────────────────────────────────────────

export interface ExecutionResult {
  success:     boolean
  message:     string
  data?:       any
  rollback_id?: string   // 可回滚的快照 ID
  preview?:    any       // preview 模式下的预计变更描述
}

// ─── 多命令 DSL（一次输入包含多个命令）────────────────────────────────────

export interface MultiCommandDsl {
  commands:    CommandDsl[]
  parallel?:   boolean    // 是否并行执行
}
