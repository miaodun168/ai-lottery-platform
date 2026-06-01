import { Injectable } from '@nestjs/common'
import {
  ParsedIntent, IntentDomain, IntentAction, IntentParams, RISKY_ACTIONS,
} from '../types/intent.types'

// ─── 意图规则（关键词 → intent）────────────────────────────────────────────

interface IntentRule {
  patterns:  RegExp[]
  domain:    IntentDomain
  action:    IntentAction
  extract?:  (text: string) => Partial<IntentParams>
}

const INTENT_RULES: IntentRule[] = [
  // ── 网站管理 ──
  {
    patterns: [/创建.{0,10}站|生成.{0,10}站|新建.{0,10}站|新增.{0,10}站/],
    domain: 'site', action: 'site_create',
    extract: t => ({
      site_name:    extractSiteName(t),
      lottery_type: extractLotteryType(t),
      theme:        extractTheme(t),
      play_count:   extractNumber(t, /(\d+)\s*个?\s*玩法/) ?? 50,
      ad_count:     extractNumber(t, /(\d+)\s*个?\s*广告/)  ?? 10,
    }),
  },
  {
    patterns: [/删除.{0,10}站|移除.{0,10}站/],
    domain: 'site', action: 'site_delete',
    extract: t => ({ site_name: extractSiteName(t) }),
  },
  {
    patterns: [/复制.{0,10}站|克隆.{0,10}站/],
    domain: 'site', action: 'site_clone',
    extract: t => ({ site_name: extractSiteName(t) }),
  },
  {
    patterns: [/发布.{0,10}站/],
    domain: 'site', action: 'site_publish',
    extract: t => ({ site_name: extractSiteName(t) }),
  },

  // ── 主题管理 ──
  {
    patterns: [/换.*主题|改成.*风格|切换.*主题|换.*风格/],
    domain: 'theme', action: 'change_theme',
    extract: t => ({ theme: extractTheme(t) }),
  },
  {
    patterns: [/创建.*主题|生成.*主题|新建.*主题/],
    domain: 'theme', action: 'create_theme',
    extract: t => ({ theme: extractThemeKeyword(t) }),
  },
  {
    patterns: [/命中.*绿色|命中.*颜色|发光.*效果/],
    domain: 'theme', action: 'modify_theme',
    extract: t => ({ keyword: t }),
  },

  // ── 布局管理 ──
  {
    patterns: [/切换.*布局|换.*布局/],
    domain: 'layout', action: 'change_layout',
    extract: t => ({ layout_code: extractLayoutCode(t) }),
  },
  {
    patterns: [/广告减少|广告.*少|减少.*广告|广告太多|广告.*减半/],
    domain: 'layout', action: 'modify_layout',
    extract: t => ({ ad_count: '-50%', keyword: 'reduce_ads' }),
  },
  {
    patterns: [/增加.{0,4}\d+.{0,4}玩法|新增.{0,4}\d+.{0,4}玩法/],
    domain: 'layout', action: 'add_play_modules',
    extract: t => ({ count: extractNumber(t, /(\d+)/) ?? 10 }),
  },
  {
    // TOP：位置关键字明确为"上/前/顶/第一位"（移动.*到 已拆分为带位置词的版本）
    patterns: [
      /放.*(?:前面|最前|顶部|最上面|上面)/,
      /移(?:到|动到).*(?:前面|最前|顶部|最上面|上面|第一位)/,
    ],
    domain: 'layout', action: 'move_component',
    extract: t => ({ component_type: extractComponentType(t), position: 'top' }),
  },
  {
    // BOTTOM：位置关键字明确为"下/后/底/最后一位"
    patterns: [
      /放.*(?:后面|底部|最底部|下面|最下面)/,
      /移(?:到|动到).*(?:后面|底部|最底部|下面|最下面|最后一位|最后)/,
    ],
    domain: 'layout', action: 'move_component',
    extract: t => ({ component_type: extractComponentType(t), position: 'bottom' }),
  },

  // ── 玩法管理 ── batch 在前，避免"批量新增…玩法"被 create_play 抢先匹配 ──
  {
    patterns: [
      /生成.{0,3}\d+.{0,3}玩法|批量.*玩法|新增.{0,3}\d+.{0,3}玩法/,
      // "新增20个平特一肖" — 无需结尾"玩法"，以 Arabic 数字+已知玩法后缀识别
      /(?:新增|生成)\s*\d+\s*个\s*.{1,12}(?:肖|尾|中特|码|行|段)/,
    ],
    domain: 'play', action: 'batch_create_play',
    extract: t => ({
      count:     extractNumber(t, /(\d+)/) ?? 20,
      play_name: extractPlayName(t),
    }),
  },
  {
    patterns: [/新增.{0,4}[一1个].{0,4}玩法|添加.{0,4}玩法|创建.{0,4}玩法/],
    domain: 'play', action: 'create_play',
    extract: t => ({ play_name: extractPlayName(t) }),
  },
  {
    patterns: [/删除.*玩法/],
    domain: 'play', action: 'delete_play',
    extract: t => ({ keyword: extractKeyword(t) }),
  },
  {
    patterns: [/停用.*玩法|隐藏.*玩法|关闭.*玩法/],
    domain: 'play', action: 'hide_play',
    extract: t => ({
      keyword:   extractKeyword(t),
      condition: t.includes('命中率') ? extractCondition(t) : undefined,
    }),
  },

  // ── 组件管理 ──
  {
    patterns: [/玩法.*卡片|改成.*卡片|切换.*卡片模板/],
    domain: 'component', action: 'change_component_template',
    extract: t => ({ component_type: 'play_card', template: extractTemplate(t) }),
  },
  {
    patterns: [/新增.*组件|添加.*组件/],
    domain: 'component', action: 'add_component',
    extract: t => ({ component_type: extractComponentType(t) }),
  },
  {
    patterns: [/删除.*组件|移除.*组件/],
    domain: 'component', action: 'remove_component',
    extract: t => ({ component_type: extractComponentType(t) }),
  },

  // ── 广告管理 ──
  {
    patterns: [/增加.{0,3}\d+.{0,3}广告|新增.*广告|添加.*广告/],
    domain: 'ad', action: 'add_ad',
    extract: t => ({ count: extractNumber(t, /(\d+)/) ?? 5 }),
  },
  {
    patterns: [/删除所有广告|移除所有广告|清空广告/],
    domain: 'ad', action: 'remove_all_ads',
    extract: _ => ({}),
  },
  {
    patterns: [/删除.*广告|移除.*广告/],
    domain: 'ad', action: 'remove_ad',
    extract: t => ({ count: extractNumber(t, /(\d+)/) ?? 1 }),
  },
  {
    patterns: [/生成.*广告/],
    domain: 'ad', action: 'generate_ad',
    extract: t => ({ theme: extractTheme(t), count: extractNumber(t, /(\d+)/) ?? 1 }),
  },

  // ── 页面管理 ──
  {
    patterns: [/新增.*页面|创建.*页面|添加.*页面/],
    domain: 'page', action: 'create_page',
    extract: t => ({ page_name: extractPageName(t) }),
  },
  {
    patterns: [/删除.*页面/],
    domain: 'page', action: 'delete_page',
    extract: t => ({ page_name: extractPageName(t) }),
  },

  // ── 开奖管理 ──
  {
    patterns: [/录入.*开奖|新增.*开奖|输入.*开奖/],
    domain: 'result', action: 'create_result',
    extract: t => ({ period: extractPeriod(t) }),
  },
  {
    patterns: [/修改.*开奖|更新.*开奖|修正.*开奖/],
    domain: 'result', action: 'update_result',
    extract: t => ({ period: extractPeriod(t) }),
  },

  // ── 规则管理 ──
  {
    patterns: [/连错.{0,3}期.*隐藏|隐藏规则.*连错/],
    domain: 'rule', action: 'update_rule',
    extract: t => ({
      rule_name:  'miss_hide_limit',
      rule_value: extractNumber(t, /连错.{0,2}(\d+)/) ?? 3,
    }),
  },
  {
    patterns: [/更新中|显示.*更新中|开启.*更新中/],
    domain: 'rule', action: 'update_rule',
    extract: t => ({
      rule_name:  'show_updating',
      rule_value: extractUpdatingPeriods(t),
    }),
  },
  {
    patterns: [/关闭.*更新中/],
    domain: 'rule', action: 'update_rule',
    extract: _ => ({ rule_name: 'show_updating', rule_value: false }),
  },

  // ── 统计 ──
  {
    patterns: [/重算.*统计|刷新.*统计|重新.*统计/],
    domain: 'statistics', action: 'rebuild_statistics',
    extract: _ => ({}),
  },

  // ── 系统 ──
  {
    patterns: [/刷新.*缓存|清除.*缓存|清空.*缓存/],
    domain: 'system', action: 'flush_cache',
    extract: _ => ({}),
  },
]

// ─── 主解析器 ─────────────────────────────────────────────────────────────

@Injectable()
export class CommandParser {

  parse(text: string): ParsedIntent[] {
    const trimmed = text.trim()
    const results: ParsedIntent[] = []

    // 支持多命令（逗号/顿号/换行分隔）
    const sentences = this.splitCommands(trimmed)

    for (const sentence of sentences) {
      const intent = this.parseSingle(sentence)
      results.push(intent)
    }

    return results
  }

  parseSingle(text: string): ParsedIntent {
    for (const rule of INTENT_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          const params = rule.extract ? rule.extract(text) : {}
          return {
            domain:     rule.domain,
            action:     rule.action,
            confidence: 0.85,
            params:     params as IntentParams,
            raw:        text,
            requires_confirmation: RISKY_ACTIONS.includes(rule.action),
          }
        }
      }
    }

    // 未识别
    return {
      domain:     'unknown',
      action:     'unknown',
      confidence: 0,
      params:     {},
      raw:        text,
      requires_confirmation: false,
    }
  }

  private splitCommands(text: string): string[] {
    return text
      .split(/[，,；;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }
}

// ─── 参数提取工具函数 ──────────────────────────────────────────────────────

function extractNumber(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern)
  return m ? parseInt(m[1]) : null
}

function extractLotteryType(text: string): string | undefined {
  if (text.includes('香港') || text.includes('港')) return 'hk'
  if (text.includes('澳门') || text.includes('澳')) return 'mo'
  if (text.includes('双采种')) return 'mix'
  return undefined
}

function extractTheme(text: string): string | undefined {
  if (text.includes('红金')) return 'theme_red_gold'
  if (text.includes('科技') || text.includes('科技蓝')) return 'theme_tech'
  if (text.includes('暗黑') || text.includes('暗色')) return 'theme_dark'
  if (text.includes('商务')) return 'theme_business'
  if (text.includes('极简')) return 'theme_minimal'
  if (text.includes('默认') || text.includes('蓝色')) return 'theme_default'
  return undefined
}

function extractThemeKeyword(text: string): string | undefined {
  const m = text.match(/(?:创建|生成|新建).{0,5}([^\s，,]{2,10}?)(?:主题|风格)/)
  return m ? m[1] : undefined
}

function extractLayoutCode(text: string): string | undefined {
  if (text.includes('极简') || text.includes('最快')) return 'layout_e'
  if (text.includes('广告优先') || text.includes('高变现')) return 'layout_c'
  if (text.includes('玩法优先') || text.includes('玩法密集')) return 'layout_b'
  if (text.includes('栏目优先')) return 'layout_d'
  return 'layout_a'
}

function extractSiteName(text: string): string | undefined {
  const m = text.match(/(?:名字|名称|叫|叫做|命名为|网站)[：:是]?\s*(.{1,20}?)(?:\s|$|，|,|。)/)
  return m ? m[1].trim() : undefined
}

function extractPlayName(text: string): string | undefined {
  const PLAY_KEYWORDS = [
    // 生肖系
    '平特一肖','绝杀一肖','绝杀二肖','绝杀三肖','六肖中特','七肖中特','九肖中特','平特六肖',
    '家禽野兽','文肖武肖','前肖后肖','阴肖阳肖','三国选一',
    // 多期系
    '三期三肖','三期六码','五期五肖',
    // 属性系
    '大小中特','单双中特','二波中特','三头中特','三行中特',
    '平特一尾','七尾中特',
    // 绝杀系
    '绝杀五码','绝杀二尾','绝杀一头','绝杀二行','绝杀半波','绝杀二段','绝杀五尾','绝杀三尾',
  ]
  // 优先最长匹配（避免"三期三肖"被"三肖"截断）
  const sorted = [...PLAY_KEYWORDS].sort((a, b) => b.length - a.length)
  for (const k of sorted) {
    if (text.includes(k)) return k
  }
  const m = text.match(/(?:创建|新增|添加)(?:一个)?\s*([^\s，,]{2,10}?)\s*玩法/)
  return m ? m[1].trim() : undefined
}

function extractComponentType(text: string): string | undefined {
  if (text.includes('开奖'))  return 'result_board'
  if (text.includes('轮播'))  return 'banner_slider'
  if (text.includes('广告'))  return 'image_ad'
  if (text.includes('栏目'))  return 'category_entry'
  if (text.includes('玩法'))  return 'play_card'
  if (text.includes('统计'))  return 'statistics_card'
  if (text.includes('公告'))  return 'notice_board'
  if (text.includes('客服'))  return 'service_box'
  return undefined
}

function extractTemplate(text: string): string | undefined {
  if (text.includes('卡片01') || text.includes('经典'))  return 'card_01'
  if (text.includes('卡片02') || text.includes('极简'))  return 'card_02'
  if (text.includes('卡片03') || text.includes('高亮'))  return 'card_03'
  if (text.includes('卡片04') || text.includes('排行'))  return 'card_04'
  return 'card_01'
}

function extractPageName(text: string): string | undefined {
  const m = text.match(/(?:删除|新增|创建).{0,4}([^\s，,]{1,10}?)(?:页面|频道|栏目)/)
  return m ? m[1].trim() : undefined
}

function extractPeriod(text: string): string | undefined {
  const m = text.match(/(\d{7,8})/)
  return m ? m[1] : undefined
}

function extractKeyword(text: string): string | undefined {
  const m = text.match(/(?:删除|停用|隐藏|关闭)\s*(.{2,10}?)\s*玩法/)
  return m ? m[1].trim() : undefined
}

function extractCondition(text: string): string | undefined {
  const m = text.match(/命中率低于(\d+)/)
  return m ? `hit_rate < ${m[1]}` : undefined
}

// ─── 中文数字解析器 ────────────────────────────────────────────────────────

const CN_NUM_MAP: Record<string, number> = {
  '零': 0, '一': 1, '两': 2, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
  '二十': 20, '三十': 30, '四十': 40, '五十': 50,
  '六十': 60, '七十': 70, '八十': 80, '九十': 90,
  '百': 100,
}

export function parseChineseNumber(cn: string): number | null {
  if (!cn) return null
  const n = parseInt(cn)
  if (!isNaN(n)) return n
  // 先尝试多字符（如"二十"），再尝试单字
  for (const [key, val] of Object.entries(CN_NUM_MAP).sort((a, b) => b[0].length - a[0].length)) {
    if (cn === key) return val
  }
  return null
}

// "显示两期更新中" → 2，"显示三期更新中" → 3，"显示更新中" → true
export function extractUpdatingPeriods(text: string): number | boolean {
  const m = text.match(/(?:显示|开启)\s*(\d+|[一两二三四五六七八九十]+)\s*期/)
  if (m) {
    const val = parseChineseNumber(m[1])
    if (val !== null) return val
  }
  return !text.includes('关闭')
}
