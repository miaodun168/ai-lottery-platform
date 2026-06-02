import { z } from 'zod'

// ─── LLM 输出的意图项 Schema ────────────────────────────────────────────────

export const LlmIntentParamsSchema = z.object({
  site_name:       z.string().optional(),
  lottery_type:    z.string().optional(),
  lottery_types:   z.array(z.string()).optional(),
  theme:           z.string().optional(),
  layout_code:     z.string().optional(),
  play_name:       z.string().optional(),
  play_names:      z.array(z.string()).optional(),
  rule_code:       z.string().optional(),
  count:           z.number().optional(),
  component_type:  z.string().optional(),
  component_id:    z.string().optional(),
  template:        z.string().optional(),
  page_type:       z.string().optional(),
  page_name:       z.string().optional(),
  period:          z.string().optional(),
  ad_count:        z.union([z.number(), z.string()]).optional(),
  position:        z.enum(['top', 'bottom']).optional(),
  condition:       z.string().optional(),
  rule_name:       z.string().optional(),
  rule_value:      z.any().optional(),
  keyword:         z.string().optional(),
}).passthrough()

export const VALID_DOMAINS = [
  'site', 'theme', 'layout', 'play', 'component',
  'ad', 'page', 'result', 'rule', 'statistics', 'system',
] as const

export const VALID_ACTIONS = [
  'site_create', 'site_update', 'site_delete', 'site_clone', 'site_publish', 'site_suspend',
  'change_theme', 'create_theme', 'modify_theme',
  'change_layout', 'modify_layout', 'add_play_modules', 'move_component',
  'create_play', 'batch_create_play', 'update_play', 'delete_play', 'hide_play',
  'add_component', 'remove_component', 'change_component_template', 'modify_component_style',
  'add_ad', 'remove_ad', 'remove_all_ads', 'generate_ad',
  'create_page', 'delete_page',
  'create_result', 'update_result', 'delete_result',
  'update_rule',
  'rebuild_statistics',
  'flush_cache',
  'unknown',
] as const

export const LlmIntentItemSchema = z.object({
  domain:                z.enum(VALID_DOMAINS),
  action:                z.enum(VALID_ACTIONS),
  confidence:            z.number().min(0).max(1).default(0.85),
  params:                LlmIntentParamsSchema.default({}),
  requires_confirmation: z.boolean().default(false),
  raw:                   z.string(),
})

// LLM 完整输出：意图数组（至少含一个）
export const LlmOutputSchema = z.array(LlmIntentItemSchema).min(1)

export type LlmIntentItem   = z.infer<typeof LlmIntentItemSchema>
export type LlmOutputResult = z.infer<typeof LlmOutputSchema>
