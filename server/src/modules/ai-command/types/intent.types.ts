// ─── 意图域（对应文档中的 A~J 分类）─────────────────────────────────────────

export type IntentDomain =
  | 'site'       // A 网站管理
  | 'theme'      // B 模板/主题管理
  | 'layout'     // C 布局管理
  | 'play'       // D 玩法管理
  | 'component'  // E 组件管理
  | 'ad'         // F 广告管理
  | 'page'       // H 页面管理
  | 'result'     // G 开奖管理
  | 'rule'       // 规则管理
  | 'statistics' // 统计管理
  | 'system'     // J 系统管理
  | 'unknown'

// ─── 意图操作 ──────────────────────────────────────────────────────────────

export type IntentAction =
  // site
  | 'site_create' | 'site_update' | 'site_delete' | 'site_clone' | 'site_publish' | 'site_suspend'
  // theme
  | 'change_theme' | 'create_theme' | 'modify_theme'
  // layout
  | 'change_layout' | 'modify_layout' | 'add_play_modules' | 'move_component'
  // play
  | 'create_play' | 'batch_create_play' | 'update_play' | 'delete_play' | 'hide_play'
  // component
  | 'add_component' | 'remove_component' | 'change_component_template' | 'modify_component_style'
  // ad
  | 'add_ad' | 'remove_ad' | 'remove_all_ads' | 'generate_ad'
  // page
  | 'create_page' | 'delete_page'
  // result
  | 'create_result' | 'update_result' | 'delete_result'
  // rule
  | 'update_rule'
  // statistics
  | 'rebuild_statistics'
  // system
  | 'flush_cache'
  | 'unknown'

// ─── 解析后的意图对象 ──────────────────────────────────────────────────────

export interface ParsedIntent {
  domain:     IntentDomain
  action:     IntentAction
  confidence: number          // 0~1 置信度
  params:     IntentParams
  raw:        string          // 原始输入
  requires_confirmation: boolean   // 高危操作需确认
}

// ─── 参数集合 ──────────────────────────────────────────────────────────────

export interface IntentParams {
  site_id?:       string
  site_name?:     string
  lottery_type?:  string    // 'hk' | 'macau' | 'mix'
  lottery_types?: string[]  // LLM 多采种输出（site_create 展开前）
  theme?:         string    // theme_code
  layout_code?:   string
  play_name?:     string
  play_names?:    string[]
  rule_code?:     string
  count?:         number
  component_type?: string
  component_id?:  string
  template?:      string
  page_type?:     string
  page_name?:     string
  period?:        string
  numbers?:       number[]
  ad_count?:      number | string  // 可以是 "-50%" 或数字
  ad_interval?:   number
  cat_positions?: number[]
  position?:      string    // 'top' | 'bottom'
  condition?:     string
  rule_name?:     string
  rule_value?:    any
  keyword?:       string
  [key: string]:  any
}

// ─── 高危操作列表 ──────────────────────────────────────────────────────────

export const RISKY_ACTIONS: IntentAction[] = [
  'site_create', 'site_delete',
  'batch_create_play', 'delete_play',
  'remove_all_ads',
  'delete_page', 'delete_result',
]
