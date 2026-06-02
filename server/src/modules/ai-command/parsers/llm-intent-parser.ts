import { Injectable, Logger } from '@nestjs/common'
import Anthropic from '@anthropic-ai/sdk'
import { LlmOutputSchema, LlmIntentItem } from '../schemas/intent-llm.schema'
import { ParsedIntent, RISKY_ACTIONS, IntentAction, IntentDomain } from '../types/intent.types'

// ─── LLM 意图解析器（Claude claude-opus-4-8 + Adaptive Thinking） ─────────────────────────────

@Injectable()
export class LlmIntentParser {
  private readonly logger = new Logger(LlmIntentParser.name)
  private client: Anthropic | null = null

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY
    if (key) {
      this.client = new Anthropic({ apiKey: key })
    } else {
      this.logger.warn('ANTHROPIC_API_KEY 未设置，LLM 解析器已禁用，将使用正则回退')
    }
  }

  // ─── 主入口 ────────────────────────────────────────────────────────────────

  async parse(text: string): Promise<ParsedIntent[] | null> {
    if (!this.client) return null

    try {
      const response = await this.client.messages.create({
        model:    'claude-opus-4-8',
        max_tokens: 2048,
        thinking: { type: 'adaptive' },
        system: [
          {
            type:          'text',
            text:          SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },   // 系统提示词大而稳定，启用缓存
          },
        ],
        messages: [{ role: 'user', content: text }],
      })

      // 提取文本内容（跳过 thinking blocks）
      const textBlock = response.content.find(b => b.type === 'text')
      if (!textBlock || textBlock.type !== 'text') return null

      const raw = this.extractJson(textBlock.text)
      const parsed = JSON.parse(raw)

      // Zod 校验
      const validated = LlmOutputSchema.parse(parsed)

      // 转换为 ParsedIntent[]（含多站点展开）
      return validated.flatMap(item => this.toParseIntent(item, text))

    } catch (err: any) {
      this.logger.warn(`LLM 解析失败，回退到正则解析器: ${err.message}`)
      return null
    }
  }

  // ─── 提取响应中的 JSON 字符串 ───────────────────────────────────────────────

  private extractJson(text: string): string {
    // 去掉 markdown 代码块
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenced) return fenced[1].trim()

    // 查找第一个 [ 到最后一个 ]
    const start = text.indexOf('[')
    const end   = text.lastIndexOf(']')
    if (start !== -1 && end !== -1) return text.slice(start, end + 1)

    return text.trim()
  }

  // ─── 将 LLM 意图项转换为 ParsedIntent ────────────────────────────────────
  // lottery_types 保留为数组（多采种站 = 一个支持双采种切换的站点，不拆分）

  private toParseIntent(item: LlmIntentItem, rawCommand: string): ParsedIntent[] {
    const params = { ...item.params }

    // 单采种简化：lottery_types: ["hk"] → lottery_type: "hk"，去掉数组
    if (params.lottery_types?.length === 1) {
      params.lottery_type  = params.lottery_types[0]
      params.lottery_types = undefined
    }
    // 多采种（如 ["hk","macau"]）保留 lottery_types，表示该站支持双采种切换

    return [{
      domain:                item.domain    as IntentDomain,
      action:                item.action    as IntentAction,
      confidence:            item.confidence,
      params,
      raw:                   rawCommand,
      // 始终以 RISKY_ACTIONS 为权威，防止 LLM 绕过确认
      requires_confirmation: RISKY_ACTIONS.includes(item.action as IntentAction),
    }]
  }
}

// ─── 系统提示词（大而稳定，配合 prompt caching）────────────────────────────

const SYSTEM_PROMPT = `你是一个专业的意图解析引擎，服务于AI彩票站群管理平台。

## 任务
将用户自然语言命令解析为严格的 JSON 意图数组。只输出 JSON，不输出任何解释。

## 支持的操作

### 网站管理 (site)
- site_create: 创建/生成/新建站点 | params: site_name?, lottery_types(数组), theme?, layout_code?, play_count?(默认50), ad_count?(默认10)
- site_delete: 删除/移除站点 | params: site_name?
- site_clone: 复制/克隆站点 | params: site_name?
- site_publish: 发布站点 | params: site_name?

### 主题管理 (theme)
- change_theme: 换/切换/改成主题或风格 | params: theme
- create_theme: 创建/新建主题 | params: keyword

### 布局管理 (layout)
- change_layout: 切换/换布局 | params: layout_code
- modify_layout: 修改布局参数（广告数量） | params: ad_count
- add_play_modules: 增加玩法模块数量 | params: count
- move_component: 移动/放置组件到指定位置 | params: component_type, position(top/bottom)

### 玩法管理 (play)
- create_play: 新增单个玩法 | params: play_name
- batch_create_play: 批量/新增一批玩法 | params: count(默认20), play_name
- delete_play: 删除玩法 | params: keyword
- hide_play: 停用/隐藏玩法 | params: keyword, condition?

### 组件管理 (component)
- add_component: 新增组件 | params: component_type
- remove_component: 删除组件 | params: component_type
- change_component_template: 切换组件模板 | params: component_type, template

### 广告管理 (ad)
- add_ad: 增加广告 | params: count
- remove_ad: 删除部分广告 | params: count
- remove_all_ads: 删除所有广告（高危）
- generate_ad: 生成广告 | params: count, theme?

### 页面管理 (page)
- create_page: 新增页面 | params: page_name
- delete_page: 删除页面 | params: page_name

### 开奖管理 (result)
- create_result: 录入开奖结果 | params: period?
- update_result: 修改开奖结果 | params: period?

### 规则管理 (rule)
- update_rule: 更新系统规则 | params: rule_name, rule_value

### 统计 (statistics)
- rebuild_statistics: 重算/刷新统计

### 系统 (system)
- flush_cache: 刷新/清除缓存

---

## 关键映射

### 主题 (theme)
| 用户表达 | theme 值 |
|---------|---------|
| 红色/红/红色风格/红色系 | theme_red_gold |
| 科技/科技风/科技感/科技蓝 | theme_tech |
| 暗黑/暗色/深色/夜间 | theme_dark |
| 商务/商务风 | theme_business |
| 极简/清爽/简洁/简约 | theme_minimal |
| 默认/蓝色/标准 | theme_default |

### 采种 (lottery_types，必须是数组)
| 用户表达 | 值 |
|---------|---|
| 香港/港彩/港 | ["hk"] |
| 澳门/澳/澳彩/macau | ["macau"] |
| 香港和澳门/香港、澳门/两个站 | ["hk","macau"] |
| 双采种 | ["hk","macau"] |

### 组件类型 (component_type)
| 用户表达 | 值 |
|---------|---|
| 开奖/开奖区/开奖板/彩票结果 | result_board |
| 轮播/banner/图片轮播 | banner_slider |
| 广告/广告图 | image_ad |
| 栏目/导航/分类 | category_entry |
| 玩法/玩法卡片/彩票玩法 | play_card |
| 统计/统计数据 | statistics_card |
| 公告/通知 | notice_board |
| 客服/联系 | service_box |

### 布局代码 (layout_code)
| 用户表达 | 值 |
|---------|---|
| 极简/最快加载/轻量 | layout_e |
| 广告优先/高变现/营收优先 | layout_c |
| 玩法优先/玩法密集/内容为主 | layout_b |
| 栏目优先 | layout_d |
| 默认/标准/均衡 | layout_a |

### 位置 (position)
| 用户表达 | 值 |
|---------|---|
| 最上/最前/顶部/最明显/最重要/第一/最突出 | top |
| 最下/最后/底部/末尾 | bottom |

### 规则名 (rule_name)
| 用户表达 | 值 |
|---------|---|
| 连错隐藏/连续错误/连错X期 | miss_hide_limit（rule_value为期数） |
| 更新中/显示更新中/Y期更新中 | show_updating（rule_value为期数或true） |

---

## 特殊处理规则

1. **双采种站**（"香港和澳门站"/"香港澳门双站"）→ 生成**一个** site_create，lottery_types: ["hk","macau"]。
   这表示该站支持两种采种切换，不是两个独立站点。
2. **广告减少/少一点/减半** → modify_layout, ad_count: "-50%", keyword: "reduce_ads"
3. **页面清爽/简洁点** → 优先 modify_layout(ad_count:"-50%")，也可 change_theme(theme:"theme_minimal")
4. **"最明显/最重要的位置"** → position: "top"
5. **"一批/一些/若干"** → batch_create_play, count: 20
6. **"连续错X期以后显示Y期更新中"** → 生成两个 update_rule：
   - {rule_name:"miss_hide_limit", rule_value: X}
   - {rule_name:"show_updating", rule_value: Y}
7. **无法理解** → [{domain:"system", action:"flush_cache", confidence:0, params:{}, requires_confirmation:false, raw:"原文"}]（但尽量避免）

---

## 高危操作（requires_confirmation: true）
site_create, site_delete, batch_create_play, delete_play, remove_all_ads, delete_page, delete_result

---

## 输出格式（严格 JSON 数组，不带任何说明）

[
  {
    "domain": "site",
    "action": "site_create",
    "confidence": 0.95,
    "params": {
      "lottery_types": ["hk", "macau"],
      "theme": "theme_red_gold",
      "layout_code": "layout_a",
      "play_count": 50,
      "ad_count": 10
    },
    "requires_confirmation": true,
    "raw": "原始命令文本"
  }
]`
