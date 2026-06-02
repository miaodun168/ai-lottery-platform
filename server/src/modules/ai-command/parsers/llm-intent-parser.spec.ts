import { LlmIntentParser } from './llm-intent-parser'

// ─── 辅助：构造 Claude 成功响应 ───────────────────────────────────────────────

function mockAnthropicResponse(json: object[]) {
  return {
    content: [{ type: 'text', text: JSON.stringify(json) }],
    stop_reason: 'end_turn',
  }
}

// ─── LlmIntentParser 单元测试 ────────────────────────────────────────────────

describe('LlmIntentParser', () => {
  let parser: LlmIntentParser

  beforeEach(() => {
    // 强制设置 API Key，使 client 初始化
    process.env.ANTHROPIC_API_KEY = 'test-key'
    parser = new LlmIntentParser()
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    jest.restoreAllMocks()
  })

  // ─── 核心辅助：替换内部 client ────────────────────────────────────────────

  function injectMockClient(responseJson: object[]) {
    ;(parser as any).client = {
      messages: {
        create: jest.fn().mockResolvedValue(mockAnthropicResponse(responseJson)),
      },
    }
  }

  // ─── TC1：创建一个红色风格的香港、澳门站 ───────────────────────────────────
  // 业务含义：一个支持香港/澳门双采种切换的站点，不是两个独立站

  it('TC1 — 红色风格香港澳门双采种站 → 一个 site_create，lottery_types 保留为数组', async () => {
    injectMockClient([
      {
        domain:                'site',
        action:                'site_create',
        confidence:            0.97,
        params:                { lottery_types: ['hk', 'macau'], theme: 'theme_red_gold', layout_code: 'layout_a' },
        requires_confirmation: true,
        raw:                   '创建一个红色风格的香港、澳门站',
      },
    ])

    const result = await parser.parse('创建一个红色风格的香港、澳门站')

    expect(result).not.toBeNull()
    // 一个站点，不拆分
    expect(result).toHaveLength(1)

    expect(result![0]).toMatchObject({
      domain:  'site',
      action:  'site_create',
      params:  {
        lottery_types: ['hk', 'macau'],   // 双采种保留为数组
        theme:         'theme_red_gold',
        layout_code:   'layout_a',
      },
      requires_confirmation: true,
    })
    // 多采种时不应自动压缩到 lottery_type（单值）
    expect(result![0].params.lottery_type).toBeUndefined()
  })

  // ─── TC2：帮我做一个科技感强一点的澳门站 ──────────────────────────────────

  it('TC2 — 科技感澳门站 → site_create theme_tech macau', async () => {
    injectMockClient([
      {
        domain:                'site',
        action:                'site_create',
        confidence:            0.94,
        params:                { lottery_types: ['macau'], theme: 'theme_tech' },
        requires_confirmation: true,
        raw:                   '帮我做一个科技感强一点的澳门站',
      },
    ])

    const result = await parser.parse('帮我做一个科技感强一点的澳门站')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      domain:  'site',
      action:  'site_create',
      params:  { lottery_type: 'macau', theme: 'theme_tech' },
      requires_confirmation: true,
    })
  })

  // ─── TC3：首页广告太多了，减少一点 ────────────────────────────────────────

  it('TC3 — 广告减少 → modify_layout ad_count=-50%', async () => {
    injectMockClient([
      {
        domain:                'layout',
        action:                'modify_layout',
        confidence:            0.91,
        params:                { ad_count: '-50%', keyword: 'reduce_ads' },
        requires_confirmation: false,
        raw:                   '首页广告太多了，减少一点',
      },
    ])

    const result = await parser.parse('首页广告太多了，减少一点')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      domain:  'layout',
      action:  'modify_layout',
      params:  { ad_count: '-50%', keyword: 'reduce_ads' },
      requires_confirmation: false,
    })
  })

  // ─── TC4：把开奖区放到最明显的位置 ────────────────────────────────────────

  it('TC4 — 开奖区最明显位置 → move_component result_board top', async () => {
    injectMockClient([
      {
        domain:                'layout',
        action:                'move_component',
        confidence:            0.95,
        params:                { component_type: 'result_board', position: 'top' },
        requires_confirmation: false,
        raw:                   '把开奖区放到最明显的位置',
      },
    ])

    const result = await parser.parse('把开奖区放到最明显的位置')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      domain:  'layout',
      action:  'move_component',
      params:  { component_type: 'result_board', position: 'top' },
    })
  })

  // ─── TC5：新增一批平特一肖玩法 ────────────────────────────────────────────

  it('TC5 — 一批平特一肖 → batch_create_play count=20', async () => {
    injectMockClient([
      {
        domain:                'play',
        action:                'batch_create_play',
        confidence:            0.96,
        params:                { play_name: '平特一肖', count: 20 },
        requires_confirmation: true,
        raw:                   '新增一批平特一肖玩法',
      },
    ])

    const result = await parser.parse('新增一批平特一肖玩法')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    expect(result![0]).toMatchObject({
      domain:  'play',
      action:  'batch_create_play',
      params:  { play_name: '平特一肖', count: 20 },
      requires_confirmation: true,
    })
  })

  // ─── TC6：连续错三期以后显示两期更新中 ────────────────────────────────────

  it('TC6 — 连错三期显示两期更新中 → 两条 update_rule', async () => {
    injectMockClient([
      {
        domain:                'rule',
        action:                'update_rule',
        confidence:            0.93,
        params:                { rule_name: 'miss_hide_limit', rule_value: 3 },
        requires_confirmation: false,
        raw:                   '连续错三期以后显示两期更新中',
      },
      {
        domain:                'rule',
        action:                'update_rule',
        confidence:            0.93,
        params:                { rule_name: 'show_updating', rule_value: 2 },
        requires_confirmation: false,
        raw:                   '连续错三期以后显示两期更新中',
      },
    ])

    const result = await parser.parse('连续错三期以后显示两期更新中')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(2)

    expect(result![0]).toMatchObject({
      domain:  'rule',
      action:  'update_rule',
      params:  { rule_name: 'miss_hide_limit', rule_value: 3 },
    })
    expect(result![1]).toMatchObject({
      domain:  'rule',
      action:  'update_rule',
      params:  { rule_name: 'show_updating', rule_value: 2 },
    })
  })

  // ─── 边界条件：API Key 未配置时返回 null ───────────────────────────────────

  it('API Key 未配置时直接返回 null（触发正则回退）', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const noKeyParser = new LlmIntentParser()
    const result = await noKeyParser.parse('创建香港站')
    expect(result).toBeNull()
  })

  // ─── 边界条件：LLM 返回无效 JSON 时返回 null ──────────────────────────────

  it('LLM 返回非 JSON 时捕获异常并返回 null', async () => {
    ;(parser as any).client = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: '抱歉，我无法理解这个命令。' }],
        }),
      },
    }

    const result = await parser.parse('...')
    expect(result).toBeNull()
  })

  // ─── 边界条件：Zod 校验失败时返回 null ────────────────────────────────────

  it('LLM 返回非法 action 时 Zod 校验失败并返回 null', async () => {
    injectMockClient([
      {
        domain:     'site',
        action:     'invalid_action_xyz',   // 不在枚举中
        confidence: 0.9,
        params:     {},
        requires_confirmation: false,
        raw:        '测试',
      },
    ])

    const result = await parser.parse('测试')
    expect(result).toBeNull()
  })

  // ─── 边界条件：Markdown 代码块包裹的 JSON 也能正确提取 ──────────────────────

  it('从 markdown 代码块中正确提取 JSON', async () => {
    ;(parser as any).client = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{
            type: 'text',
            text: '```json\n[{"domain":"system","action":"flush_cache","confidence":0.9,"params":{},"requires_confirmation":false,"raw":"刷新缓存"}]\n```',
          }],
        }),
      },
    }

    const result = await parser.parse('刷新缓存')
    expect(result).not.toBeNull()
    expect(result![0]).toMatchObject({ domain: 'system', action: 'flush_cache' })
  })

  // ─── 边界条件：RISKY_ACTIONS 覆盖 LLM 的 requires_confirmation ─────────────

  it('RISKY_ACTIONS 强制覆盖 LLM 的 requires_confirmation', async () => {
    injectMockClient([
      {
        domain:                'site',
        action:                'site_create',
        confidence:            0.9,
        params:                { lottery_types: ['hk'], theme: 'theme_default' },
        requires_confirmation: false,   // LLM 说不需要确认
        raw:                   '创建香港站',
      },
    ])

    const result = await parser.parse('创建香港站')
    // site_create 在 RISKY_ACTIONS 中，应强制要求确认
    expect(result![0].requires_confirmation).toBe(true)
  })
})
