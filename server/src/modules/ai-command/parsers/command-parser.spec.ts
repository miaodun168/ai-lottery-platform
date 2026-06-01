import { CommandParser, parseChineseNumber, extractUpdatingPeriods } from './command-parser'

// ─── 工具函数测试 ──────────────────────────────────────────────────────────

describe('parseChineseNumber', () => {
  it('Arabic digits pass through unchanged', () => {
    expect(parseChineseNumber('20')).toBe(20)
    expect(parseChineseNumber('50')).toBe(50)
    expect(parseChineseNumber('3')).toBe(3)
  })

  it('单字中文数字', () => {
    expect(parseChineseNumber('一')).toBe(1)
    expect(parseChineseNumber('两')).toBe(2)
    expect(parseChineseNumber('二')).toBe(2)
    expect(parseChineseNumber('三')).toBe(3)
    expect(parseChineseNumber('四')).toBe(4)
    expect(parseChineseNumber('五')).toBe(5)
    expect(parseChineseNumber('六')).toBe(6)
    expect(parseChineseNumber('七')).toBe(7)
    expect(parseChineseNumber('八')).toBe(8)
    expect(parseChineseNumber('九')).toBe(9)
    expect(parseChineseNumber('十')).toBe(10)
  })

  it('复合中文数字', () => {
    expect(parseChineseNumber('二十')).toBe(20)
    expect(parseChineseNumber('三十')).toBe(30)
    expect(parseChineseNumber('五十')).toBe(50)
  })

  it('空字符串返回 null', () => {
    expect(parseChineseNumber('')).toBeNull()
  })

  it('无法识别的字符串返回 null', () => {
    expect(parseChineseNumber('abc')).toBeNull()
  })
})

// ─── extractUpdatingPeriods 测试 ───────────────────────────────────────────

describe('extractUpdatingPeriods', () => {
  it('显示两期更新中 → 2', () => {
    expect(extractUpdatingPeriods('显示两期更新中')).toBe(2)
  })

  it('显示三期更新中 → 3', () => {
    expect(extractUpdatingPeriods('显示三期更新中')).toBe(3)
  })

  it('显示五期更新中 → 5', () => {
    expect(extractUpdatingPeriods('显示五期更新中')).toBe(5)
  })

  it('显示3期更新中（Arabic）→ 3', () => {
    expect(extractUpdatingPeriods('显示3期更新中')).toBe(3)
  })

  it('显示更新中（无期数）→ true', () => {
    expect(extractUpdatingPeriods('显示更新中')).toBe(true)
  })

  it('关闭更新中 → false', () => {
    expect(extractUpdatingPeriods('关闭更新中')).toBe(false)
  })
})

// ─── CommandParser 主测试 ──────────────────────────────────────────────────

describe('CommandParser', () => {
  let parser: CommandParser

  beforeEach(() => {
    parser = new CommandParser()
  })

  // ── 玩法命令 ─────────────────────────────────────────────────────────────

  describe('玩法命令 — batch_create_play（无结尾"玩法"）', () => {
    it('新增20个平特一肖', () => {
      const [intent] = parser.parse('新增20个平特一肖')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.domain).toBe('play')
      expect(intent.params.count).toBe(20)
      expect(intent.params.play_name).toBe('平特一肖')
    })

    it('新增50个三期三肖', () => {
      const [intent] = parser.parse('新增50个三期三肖')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(50)
      expect(intent.params.play_name).toBe('三期三肖')
    })

    it('新增30个绝杀一肖', () => {
      const [intent] = parser.parse('新增30个绝杀一肖')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(30)
      expect(intent.params.play_name).toBe('绝杀一肖')
    })

    it('新增10个大小中特', () => {
      const [intent] = parser.parse('新增10个大小中特')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(10)
      expect(intent.params.play_name).toBe('大小中特')
    })

    it('生成20个绝杀五码', () => {
      const [intent] = parser.parse('生成20个绝杀五码')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(20)
      expect(intent.params.play_name).toBe('绝杀五码')
    })
  })

  describe('玩法命令 — 兼容原有形式（有结尾"玩法"）', () => {
    it('批量新增20个平特一肖玩法', () => {
      const [intent] = parser.parse('批量新增20个平特一肖玩法')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(20)
    })

    it('生成50个玩法', () => {
      const [intent] = parser.parse('生成50个玩法')
      expect(intent.action).toBe('batch_create_play')
      expect(intent.params.count).toBe(50)
    })
  })

  // ── 布局命令 — 置顶 ────────────────────────────────────────────────────

  describe('布局命令 — move_component TOP', () => {
    it('放到最上面', () => {
      const [intent] = parser.parse('放到最上面')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('top')
    })

    it('放到上面', () => {
      const [intent] = parser.parse('放到上面')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('top')
    })

    it('移动到第一位', () => {
      const [intent] = parser.parse('移动到第一位')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('top')
    })

    it('把开奖放到顶部（原有）', () => {
      const [intent] = parser.parse('把开奖放到顶部')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('top')
      expect(intent.params.component_type).toBe('result_board')
    })

    it('把广告放到前面（原有）', () => {
      const [intent] = parser.parse('把广告放到前面')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('top')
    })
  })

  describe('布局命令 — move_component BOTTOM', () => {
    it('放到最底部', () => {
      const [intent] = parser.parse('放到最底部')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('bottom')
    })

    it('放到下面', () => {
      const [intent] = parser.parse('放到下面')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('bottom')
    })

    it('移动到最后一位', () => {
      const [intent] = parser.parse('移动到最后一位')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('bottom')
    })

    it('把广告放到后面（原有）', () => {
      const [intent] = parser.parse('把广告放到后面')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('bottom')
    })

    it('把玩法放到底部（原有）', () => {
      const [intent] = parser.parse('把玩法放到底部')
      expect(intent.action).toBe('move_component')
      expect(intent.params.position).toBe('bottom')
    })
  })

  // ── 规则命令 — show_updating ───────────────────────────────────────────

  describe('规则命令 — show_updating 期数提取', () => {
    it('显示两期更新中 → rule_value=2', () => {
      const [intent] = parser.parse('显示两期更新中')
      expect(intent.action).toBe('update_rule')
      expect(intent.params.rule_name).toBe('show_updating')
      expect(intent.params.rule_value).toBe(2)
    })

    it('显示三期更新中 → rule_value=3', () => {
      const [intent] = parser.parse('显示三期更新中')
      expect(intent.params.rule_value).toBe(3)
    })

    it('显示五期更新中 → rule_value=5', () => {
      const [intent] = parser.parse('显示五期更新中')
      expect(intent.params.rule_value).toBe(5)
    })

    it('连错三期显示两期更新中 → rule_value=2（兼容原有长格式）', () => {
      const [intent] = parser.parse('连错三期显示两期更新中')
      expect(intent.action).toBe('update_rule')
      expect(intent.params.rule_name).toBe('show_updating')
      expect(intent.params.rule_value).toBe(2)
    })

    it('开启更新中（无期数）→ rule_value=true', () => {
      const [intent] = parser.parse('开启更新中')
      expect(intent.params.rule_name).toBe('show_updating')
      expect(intent.params.rule_value).toBe(true)
    })

    it('关闭更新中 → rule_value=false', () => {
      const [intent] = parser.parse('关闭更新中')
      expect(intent.params.rule_name).toBe('show_updating')
      expect(intent.params.rule_value).toBe(false)
    })
  })

  // ── 回归测试 — 原有命令不受影响 ────────────────────────────────────────

  describe('回归测试 — 原有命令', () => {
    it('创建一个红金风格香港站', () => {
      const [intent] = parser.parse('创建一个红金风格香港站')
      expect(intent.action).toBe('site_create')
      expect(intent.params.lottery_type).toBe('hk')
      expect(intent.params.theme).toBe('theme_red_gold')
    })

    it('换成红金主题', () => {
      const [intent] = parser.parse('换成红金主题')
      expect(intent.action).toBe('change_theme')
      expect(intent.params.theme).toBe('theme_red_gold')
    })

    it('广告减半', () => {
      const [intent] = parser.parse('广告减半')
      expect(intent.action).toBe('modify_layout')
      expect(intent.params.ad_count).toBe('-50%')
    })

    it('把首页广告减少一半', () => {
      const [intent] = parser.parse('把首页广告减少一半')
      expect(intent.action).toBe('modify_layout')
    })

    it('录入第2026120期开奖结果', () => {
      const [intent] = parser.parse('录入第2026120期开奖结果')
      expect(intent.action).toBe('create_result')
      expect(intent.params.period).toBe('2026120')
    })

    it('连错三期隐藏', () => {
      const [intent] = parser.parse('连错三期隐藏')
      expect(intent.action).toBe('update_rule')
      expect(intent.params.rule_name).toBe('miss_hide_limit')
    })

    it('刷新缓存', () => {
      const [intent] = parser.parse('刷新缓存')
      expect(intent.action).toBe('flush_cache')
    })
  })

  // ── 多命令拆分 ─────────────────────────────────────────────────────────

  describe('多命令拆分', () => {
    it('换红金主题，新增20个平特一肖，把开奖放到顶部', () => {
      const intents = parser.parse('换红金主题，新增20个平特一肖，把开奖放到顶部')
      expect(intents).toHaveLength(3)
      expect(intents[0].action).toBe('change_theme')
      expect(intents[1].action).toBe('batch_create_play')
      expect(intents[1].params.count).toBe(20)
      expect(intents[2].action).toBe('move_component')
      expect(intents[2].params.position).toBe('top')
    })
  })

  // ── 未知命令 ──────────────────────────────────────────────────────────

  describe('未知命令', () => {
    it('无法识别的命令返回 unknown', () => {
      const [intent] = parser.parse('今天天气很好')
      expect(intent.action).toBe('unknown')
      expect(intent.domain).toBe('unknown')
      expect(intent.confidence).toBe(0)
    })
  })
})
