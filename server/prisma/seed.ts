import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function now(): Date {
  return new Date()
}

// ─── 1. system_setting ────────────────────────────────────────────────────────

async function seedSystemSettings() {
  const settings = [
    { setting_key: 'system_name',              setting_value: 'AI预测站群系统' },
    { setting_key: 'timezone',                 setting_value: 'Asia/Shanghai' },
    { setting_key: 'language',                 setting_value: 'zh-CN' },
    { setting_key: 'enable_ai',                setting_value: 'true' },
    { setting_key: 'enable_cache',             setting_value: 'true' },
    { setting_key: 'enable_statistics',        setting_value: 'true' },
    { setting_key: 'enable_auto_settlement',   setting_value: 'true' },
    { setting_key: 'enable_auto_publish',      setting_value: 'true' },
    { setting_key: 'miss_hide_limit',          setting_value: '3' },
    { setting_key: 'show_updating',            setting_value: 'false' },
    { setting_key: 'updating_count',           setting_value: '2' },
    { setting_key: 'max_period_per_year',      setting_value: '366' },
    { setting_key: 'generate_once_per_year',   setting_value: 'true' },
    { setting_key: 'allow_regenerate',         setting_value: 'false' },
    { setting_key: 'result_input_mode',        setting_value: 'manual' },
    { setting_key: 'enable_api_import',        setting_value: 'false' },
    { setting_key: 'statistics_cache_minutes', setting_value: '30' },
    { setting_key: 'homepage_cache_minutes',   setting_value: '10' },
    { setting_key: 'default_ad_count',         setting_value: '10' },
    { setting_key: 'enable_ad_module',         setting_value: 'true' },
    { setting_key: 'site_status',              setting_value: 'draft' },
    { setting_key: 'play_count',               setting_value: '50' },
    { setting_key: 'ad_count',                 setting_value: '10' },
    { setting_key: 'category_count',           setting_value: '3' },
    { setting_key: 'enable_lazy_load',         setting_value: 'true' },
    { setting_key: 'auto_create_site',         setting_value: 'true' },
    { setting_key: 'auto_create_page',         setting_value: 'true' },
    { setting_key: 'auto_create_component',    setting_value: 'true' },
    { setting_key: 'auto_generate_prediction', setting_value: 'true' },
    { setting_key: 'seo_title',                setting_value: '免费精准预测平台' },
    { setting_key: 'seo_keywords',             setting_value: '平特一肖,六肖,平特一肖预测,澳门六合彩,香港六合彩' },
    { setting_key: 'seo_description',          setting_value: '提供香港澳门预测数据及历史统计分析' },
  ]

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where:  { setting_key: s.setting_key },
      update: { setting_value: s.setting_value, updated_at: now() },
      create: { ...s, updated_at: now() },
    })
  }
  console.log(`✓ system_setting: ${settings.length} records`)
}

// ─── 2. lottery_type ──────────────────────────────────────────────────────────

async function seedLotteryTypes() {
  const types = [
    { code: 'hk',    name: '香港', draw_time: null,    status: true },
    { code: 'macau', name: '澳门', draw_time: '21:30', status: true },
  ]

  for (const t of types) {
    const exists = await prisma.lotteryType.findFirst({ where: { code: t.code } })
    if (!exists) {
      await prisma.lotteryType.create({ data: { ...t, created_at: now() } })
    }
  }
  console.log(`✓ lottery_type: ${types.length} records`)
}

// ─── 3. default_theme ─────────────────────────────────────────────────────────

async function seedDefaultTheme() {
  const themes = [
    {
      theme_code: 'default_blue',
      theme_name: '默认蓝色主题',
      config_json: {
        primary_color: '#1677ff',
        secondary_color: '#0958d9',
        background_color: '#f0f2f5',
        text_color: '#000000',
        font_family: 'PingFang SC, Microsoft YaHei, sans-serif',
        border_radius: '6px',
        nav_style: 'top',
        card_shadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
    {
      theme_code: 'dark_red',
      theme_name: '暗红主题',
      config_json: {
        primary_color: '#cf1322',
        secondary_color: '#a8071a',
        background_color: '#141414',
        text_color: '#ffffff',
        font_family: 'PingFang SC, Microsoft YaHei, sans-serif',
        border_radius: '4px',
        nav_style: 'side',
        card_shadow: '0 2px 8px rgba(255,0,0,0.15)',
      },
    },
  ]

  for (const t of themes) {
    const exists = await prisma.theme.findFirst({ where: { theme_code: t.theme_code } })
    if (!exists) {
      await prisma.theme.create({ data: { ...t, created_at: now() } })
    }
  }
  console.log(`✓ theme: ${themes.length} records`)
}

// ─── 4. default_layout ────────────────────────────────────────────────────────

async function seedDefaultLayout() {
  const layouts = [
    {
      layout_code: 'layout_a',
      layout_name: '默认布局A',
      config_json: {
        structure: ['logo', 'result', 'banner', 'lottery_switch', 'play_list', 'bottom_nav'],
        fixed_components: ['logo', 'result', 'banner', 'lottery_switch', 'bottom_nav'],
        play_section: {
          columns: 1,
          items_per_page: 50,
          category_insert: [
            { position: '1/4', type: 'category' },
            { position: '2/4', type: 'category' },
            { position: '3/4', type: 'category' },
          ],
        },
        default_pages: [
          { name: '开奖记录', slug: 'history' },
          { name: '玩法大全', slug: 'plays' },
          { name: '命中统计', slug: 'statistics' },
        ],
        seo: {
          title:       '免费精准预测平台',
          keywords:    '平特一肖,六肖,平特一肖预测,澳门六合彩,香港六合彩',
          description: '提供香港澳门预测数据及历史统计分析',
        },
      },
    },
    {
      layout_code: 'layout_b',
      layout_name: '双栏布局B',
      config_json: {
        structure: ['logo', 'result', 'banner', 'lottery_switch', 'play_grid', 'bottom_nav'],
        fixed_components: ['logo', 'result', 'banner', 'lottery_switch', 'bottom_nav'],
        play_section: {
          columns: 2,
          items_per_page: 50,
          category_insert: [
            { position: '1/4', type: 'category' },
            { position: '2/4', type: 'category' },
            { position: '3/4', type: 'category' },
          ],
        },
        default_pages: [
          { name: '开奖记录', slug: 'history' },
          { name: '玩法大全', slug: 'plays' },
          { name: '命中统计', slug: 'statistics' },
        ],
        seo: {
          title:       '免费精准预测平台',
          keywords:    '平特一肖,六肖,平特一肖预测,澳门六合彩,香港六合彩',
          description: '提供香港澳门预测数据及历史统计分析',
        },
      },
    },
  ]

  for (const l of layouts) {
    const exists = await prisma.layout.findFirst({ where: { layout_code: l.layout_code } })
    if (!exists) {
      await prisma.layout.create({ data: { ...l, created_at: now() } })
    }
  }
  console.log(`✓ layout: ${layouts.length} records`)
}

// ─── 5. play_rule ─────────────────────────────────────────────────────────────

async function seedPlayRules() {
  const rules = [
    // ── 普通玩法 20001~20029 ──
    { rule_code: '20001', rule_name: '平特一肖',   predict_type: 'attr_1',  target_scope: 'pt', hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20002', rule_name: '平特一尾',   predict_type: 'number_2', target_scope: 'pt', hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20003', rule_name: '二波中特',   predict_type: 'attr_3',  target_scope: 't',  hit_mode: 'include', select_count: 2,  group_size: 1 },
    { rule_code: '20004', rule_name: '绝杀五码',   predict_type: 'number',  target_scope: 't',  hit_mode: 'exclude', select_count: 5,  group_size: 1 },
    { rule_code: '20005', rule_name: '单双中特',   predict_type: 'attr_6',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20006', rule_name: '大小中特',   predict_type: 'attr_7',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20007', rule_name: '绝杀二尾',   predict_type: 'number_2', target_scope: 't',  hit_mode: 'exclude', select_count: 2,  group_size: 1 },
    { rule_code: '20008', rule_name: '绝杀一头',   predict_type: 'number_1', target_scope: 't',  hit_mode: 'exclude', select_count: 1,  group_size: 1 },
    { rule_code: '20009', rule_name: '绝杀二行',   predict_type: 'attr_2',  target_scope: 't',  hit_mode: 'exclude', select_count: 2,  group_size: 1 },
    { rule_code: '20010', rule_name: '绝杀一肖',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'exclude', select_count: 1,  group_size: 1 },
    { rule_code: '20011', rule_name: '绝杀二个半波', predict_type: 'attr_11', target_scope: 't',  hit_mode: 'exclude', select_count: 1,  group_size: 1 },
    { rule_code: '20012', rule_name: '绝杀二段',   predict_type: 'attr_9',  target_scope: 't',  hit_mode: 'exclude', select_count: 2,  group_size: 1 },
    { rule_code: '20013', rule_name: '绝杀二合',   predict_type: 'attr_11', target_scope: 't',  hit_mode: 'exclude', select_count: 2,  group_size: 1 },
    { rule_code: '20014', rule_name: '七肖中特',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'include', select_count: 7,  group_size: 1 },
    { rule_code: '20015', rule_name: '七尾中特',   predict_type: 'number_2', target_scope: 't',  hit_mode: 'include', select_count: 7,  group_size: 1 },
    { rule_code: '20016', rule_name: '家禽野兽',   predict_type: 'attr_5',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20017', rule_name: '文肖武肖',   predict_type: 'attr_5',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20018', rule_name: '前肖后肖',   predict_type: 'attr_5',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20019', rule_name: '阴肖阳肖',   predict_type: 'attr_5',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20020', rule_name: '绝杀三肖',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'exclude', select_count: 3,  group_size: 1 },
    { rule_code: '20021', rule_name: '九肖中特',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'include', select_count: 9,  group_size: 1 },
    { rule_code: '20022', rule_name: '绝杀二肖',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'exclude', select_count: 2,  group_size: 1 },
    { rule_code: '20023', rule_name: '三头中特',   predict_type: 'number_1', target_scope: 't',  hit_mode: 'include', select_count: 3,  group_size: 1 },
    { rule_code: '20024', rule_name: '绝杀五尾',   predict_type: 'number_2', target_scope: 't',  hit_mode: 'exclude', select_count: 5,  group_size: 1 },
    { rule_code: '20025', rule_name: '绝杀三尾',   predict_type: 'number_2', target_scope: 't',  hit_mode: 'exclude', select_count: 3,  group_size: 1 },
    { rule_code: '20026', rule_name: '三国选一',   predict_type: 'attr_5',  target_scope: 't',  hit_mode: 'include', select_count: 1,  group_size: 1 },
    { rule_code: '20027', rule_name: '三行中特',   predict_type: 'attr_2',  target_scope: 't',  hit_mode: 'include', select_count: 3,  group_size: 1 },
    { rule_code: '20028', rule_name: '六肖中特',   predict_type: 'attr_1',  target_scope: 't',  hit_mode: 'include', select_count: 6,  group_size: 1 },
    { rule_code: '20029', rule_name: '平特六肖',   predict_type: 'attr_1',  target_scope: 'pt', hit_mode: 'include', select_count: 6,  group_size: 1 },
    // ── 多期玩法 30001~30003 ──
    { rule_code: '30001', rule_name: '三期三肖',   predict_type: 'attr_1',  target_scope: 'pt', hit_mode: 'include', select_count: 3,  group_size: 3 },
    { rule_code: '30002', rule_name: '三期六码',   predict_type: 'number',  target_scope: 'pt', hit_mode: 'include', select_count: 6,  group_size: 3 },
    { rule_code: '30003', rule_name: '五期五肖',   predict_type: 'attr_1',  target_scope: 'pt', hit_mode: 'include', select_count: 5,  group_size: 5 },
  ]

  for (const r of rules) {
    const exists = await prisma.playRule.findFirst({ where: { rule_code: r.rule_code } })
    if (!exists) {
      await prisma.playRule.create({
        data: {
          rule_code:  r.rule_code,
          rule_name:  r.rule_name,
          dsl: JSON.stringify({
            rule_code:    r.rule_code,
            rule_name:    r.rule_name,
            predict_type: r.predict_type,
            target_scope: r.target_scope,
            hit_mode:     r.hit_mode,
            select_count: r.select_count,
            group_size:   r.group_size,
            version:      'v1.0',
          }),
          version:    'v1.0',
          status:     true,
          created_at: now(),
        },
      })
    }
  }
  console.log(`✓ play_rule: ${rules.length} records`)
}

// ─── 6. attribute_library ─────────────────────────────────────────────────────

async function seedAttributeLibrary() {
  const attrs: Array<{
    attribute_type:  string
    attribute_name:  string
    attribute_value: string
    year:            number | null
    is_dynamic:      boolean
  }> = []

  // ── 波色（固定）──
  attrs.push(
    { attribute_type: 'wave_color', attribute_name: '红波', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46]) },
    { attribute_type: 'wave_color', attribute_name: '蓝波', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48]) },
    { attribute_type: 'wave_color', attribute_name: '绿波', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49]) },
  )

  // ── 左右（固定）──
  attrs.push(
    { attribute_type: 'left_right', attribute_name: '左边', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([1,2,3,4,8,9,10,11,15,16,17,18,22,23,24,29,30,31,36,37,38,43,44,45]) },
    { attribute_type: 'left_right', attribute_name: '右边', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([5,6,7,12,13,14,19,20,21,25,26,27,28,32,33,34,35,39,40,41,42,46,47,48,49]) },
  )

  // ── 内外围（固定）──
  attrs.push(
    { attribute_type: 'inner_outer', attribute_name: '内围', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([9,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30,31,32,33,34,37,38,39,40,41]) },
    { attribute_type: 'inner_outer', attribute_name: '外围', is_dynamic: false, year: null,
      attribute_value: JSON.stringify([1,2,3,4,5,6,7,8,14,15,21,22,28,29,35,36,42,43,44,45,46,47,48,49]) },
  )

  // ── 大小（固定）──
  attrs.push(
    { attribute_type: 'big_small', attribute_name: '小', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 24)) },
    { attribute_type: 'big_small', attribute_name: '大', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(25, 49)) },
  )

  // ── 单双（固定）──
  attrs.push(
    { attribute_type: 'odd_even', attribute_name: '单', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => n % 2 !== 0)) },
    { attribute_type: 'odd_even', attribute_name: '双', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => n % 2 === 0)) },
  )

  // ── 合数单双（固定）──
  // 合单：各位数字之和为奇数
  // 合双：各位数字之和为偶数
  const digitSum = (n: number) => String(n).split('').reduce((s, d) => s + parseInt(d), 0)
  attrs.push(
    { attribute_type: 'sum_odd_even', attribute_name: '合单', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => digitSum(n) % 2 !== 0)) },
    { attribute_type: 'sum_odd_even', attribute_name: '合双', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => digitSum(n) % 2 === 0)) },
  )

  // ── 头数（固定）──
  attrs.push(
    { attribute_type: 'head_digit', attribute_name: '0头', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 9)) },
    { attribute_type: 'head_digit', attribute_name: '1头', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(10, 19)) },
    { attribute_type: 'head_digit', attribute_name: '2头', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(20, 29)) },
    { attribute_type: 'head_digit', attribute_name: '3头', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(30, 39)) },
    { attribute_type: 'head_digit', attribute_name: '4头', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(40, 49)) },
  )

  // ── 尾数（固定）──
  for (let tail = 0; tail <= 9; tail++) {
    const nums = range(1, 49).filter(n => n % 10 === tail)
    attrs.push({
      attribute_type: 'tail_digit',
      attribute_name: `${tail}尾`,
      is_dynamic: false,
      year: null,
      attribute_value: JSON.stringify(nums),
    })
  }

  // ── 五段（固定）──
  const segments = [
    { name: '第一段', start: 1,  end: 10 },
    { name: '第二段', start: 11, end: 20 },
    { name: '第三段', start: 21, end: 30 },
    { name: '第四段', start: 31, end: 40 },
    { name: '第五段', start: 41, end: 49 },
  ]
  for (const seg of segments) {
    attrs.push({
      attribute_type:  'five_segment',
      attribute_name:  seg.name,
      is_dynamic:      false,
      year:            null,
      attribute_value: JSON.stringify(range(seg.start, seg.end)),
    })
  }

  // ── 家禽野兽（固定，按生肖名）──
  attrs.push(
    { attribute_type: 'domestic_wild', attribute_name: '家禽', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['牛','马','羊','鸡','狗','猪']) },
    { attribute_type: 'domestic_wild', attribute_name: '野兽', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','虎','兔','龙','蛇','猴']) },
  )

  // ── 文武（固定）──
  attrs.push(
    { attribute_type: 'civil_martial', attribute_name: '文肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','兔','龙','羊','鸡','猪']) },
    { attribute_type: 'civil_martial', attribute_name: '武肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['牛','虎','蛇','马','猴','狗']) },
  )

  // ── 前后（固定）──
  attrs.push(
    { attribute_type: 'front_back', attribute_name: '前肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','牛','虎','兔','龙','蛇']) },
    { attribute_type: 'front_back', attribute_name: '后肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['马','羊','猴','鸡','狗','猪']) },
  )

  // ── 阴阳（固定）──
  attrs.push(
    { attribute_type: 'yin_yang', attribute_name: '阴肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','龙','马','蛇','狗','猪']) },
    { attribute_type: 'yin_yang', attribute_name: '阳肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鸡','兔','牛','羊','虎','猴']) },
  )

  // ── 天地（固定）──
  attrs.push(
    { attribute_type: 'heaven_earth', attribute_name: '天肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['兔','马','猴','猪','牛','龙']) },
    { attribute_type: 'heaven_earth', attribute_name: '地肖', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','虎','蛇','羊','鸡','狗']) },
  )

  // ── 三国（固定）──
  attrs.push(
    { attribute_type: 'three_kingdoms', attribute_name: '吴国', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['虎','兔','龙','蛇']) },
    { attribute_type: 'three_kingdoms', attribute_name: '蜀国', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['马','羊','猴','鸡']) },
    { attribute_type: 'three_kingdoms', attribute_name: '魏国', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(['鼠','牛','狗','猪']) },
  )

  // ── 合数大小（固定）──
  // 合数小：各位数字之和 ≤ 6
  // 合数大：各位数字之和 ≥ 7
  attrs.push(
    { attribute_type: 'sum_big_small', attribute_name: '合数小', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => digitSum(n) <= 6)) },
    { attribute_type: 'sum_big_small', attribute_name: '合数大', is_dynamic: false, year: null,
      attribute_value: JSON.stringify(range(1, 49).filter(n => digitSum(n) >= 7)) },
  )

  // ── 生肖号码（动态，2026马年）──
  // 规则：当年生肖从01开始，每隔12号分配；当年生肖取5个号码，其余取4个
  // 2026马年示例（文档明确）：马 01,13,25,37,49
  const zodiacOrder2026 = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊']
  for (let i = 0; i < 12; i++) {
    const zodiac = zodiacOrder2026[i]
    const nums: number[] = []
    for (let n = i + 1; n <= 49; n += 12) nums.push(n)
    attrs.push({
      attribute_type:  'zodiac_number',
      attribute_name:  zodiac,
      is_dynamic:      true,
      year:            2026,
      attribute_value: JSON.stringify(nums),
    })
  }

  // ── 五行（动态，2026马年）──
  // 对应关系：马蛇→火，龙牛狗羊→土，兔虎→木，鼠猪→水，鸡猴→金
  const elementMap2026: Record<string, string> = {
    '马': '火', '蛇': '火',
    '龙': '土', '牛': '土', '狗': '土', '羊': '土',
    '兔': '木', '虎': '木',
    '鼠': '水', '猪': '水',
    '鸡': '金', '猴': '金',
  }
  const elementNumbers: Record<string, number[]> = { '金': [], '木': [], '水': [], '火': [], '土': [] }
  for (let i = 0; i < 12; i++) {
    const zodiac = zodiacOrder2026[i]
    const element = elementMap2026[zodiac]
    for (let n = i + 1; n <= 49; n += 12) elementNumbers[element].push(n)
  }
  for (const [elementName, nums] of Object.entries(elementNumbers)) {
    attrs.push({
      attribute_type:  'element',
      attribute_name:  elementName,
      is_dynamic:      true,
      year:            2026,
      attribute_value: JSON.stringify(nums.sort((a, b) => a - b)),
    })
  }

  // ── 批量插入（跳过已存在记录）──
  let inserted = 0
  for (const a of attrs) {
    const exists = await prisma.attributeLibrary.findFirst({
      where: {
        attribute_type: a.attribute_type,
        attribute_name: a.attribute_name,
        year:           a.year,
      },
    })
    if (!exists) {
      await prisma.attributeLibrary.create({
        data: { ...a, created_at: now() },
      })
      inserted++
    }
  }
  console.log(`✓ attribute_library: ${inserted} inserted, ${attrs.length} total`)
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== AI Lottery Platform - Seeding ===')
  console.log('Order: system_setting → lottery_type → theme → layout → play_rule → attribute_library')
  console.log()

  await seedSystemSettings()
  await seedLotteryTypes()
  await seedDefaultTheme()
  await seedDefaultLayout()
  await seedPlayRules()
  await seedAttributeLibrary()

  console.log()
  console.log('=== Seeding completed ===')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
