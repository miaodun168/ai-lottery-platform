export type ComponentType =
  | 'logo'              // C001 L1
  | 'result_board'      // C002 L1
  | 'banner_slider'     // C003 L1
  | 'lottery_switch'    // C004 L1
  | 'bottom_nav'        // C005 L1
  | 'play_card'         // C101 L2
  | 'multi_period_play' // C102 L2
  | 'category_entry'    // C103 L2
  | 'statistics_card'   // C104 L2
  | 'history_result'    // C201 L3
  | 'attribute_detail'  // C202 L3
  | 'notice_board'      // C203 L3
  | 'service_box'       // C204 L3
  | 'image_ad'          // C301 L4
  | 'text_ad'           // C302 L4
  | 'popup_ad'          // C304 L4
  | 'home_container'    // C401 L5
  | 'statistics_container' // C403 L5
  | 'result_container'  // C404 L5

export interface LayoutSlot {
  type:        ComponentType
  level:       'L1'|'L2'|'L3'|'L4'|'L5'
  fixed:       boolean          // 不可删除
  data_key?:   string           // 数据源 key
  play_index?: number           // 对应第几个玩法（0-based）
  ad_index?:   number           // 对应第几个广告
  cat_index?:  number           // 对应第几个栏目
  lazy?:       boolean
  visible:     boolean
  sort:        number
  template?:   string           // 组件模板版本（card_01~04 等）
  mobile:      boolean
  desktop:     boolean
}

export interface LayoutConfig {
  code:        string
  name:        string
  description: string
  play_count:  number
  ad_count:    number
  cat_count:   number
  ad_interval: number          // 每几个玩法插一个广告
  cat_positions: number[]      // 栏目插入的模块序号（0-based from content area）
  lazy_initial: number         // 首屏加载组件数
  lazy_batch:   number         // 每次滚动加载数
}

// ─── 五种布局配置 ──────────────────────────────────────────────────────────

export const LAYOUT_A: LayoutConfig = {
  code: 'layout_a', name: '标准均衡布局', description: '玩法/广告/栏目均匀分布，默认推荐',
  play_count: 50, ad_count: 10, cat_count: 3,
  ad_interval: 5, cat_positions: [9, 24, 39],
  lazy_initial: 10, lazy_batch: 5,
}

export const LAYOUT_B: LayoutConfig = {
  code: 'layout_b', name: '玩法优先布局', description: '玩法密集，广告较少',
  play_count: 50, ad_count: 5, cat_count: 2,
  ad_interval: 10, cat_positions: [14, 34],
  lazy_initial: 12, lazy_batch: 8,
}

export const LAYOUT_C: LayoutConfig = {
  code: 'layout_c', name: '广告优先布局', description: '高变现，广告频率高',
  play_count: 40, ad_count: 15, cat_count: 2,
  ad_interval: 3, cat_positions: [8, 24],
  lazy_initial: 8, lazy_batch: 5,
}

export const LAYOUT_D: LayoutConfig = {
  code: 'layout_d', name: '栏目优先布局', description: '栏目入口前置，适合大型站',
  play_count: 50, ad_count: 8, cat_count: 5,
  ad_interval: 6, cat_positions: [3, 10, 20, 30, 40],
  lazy_initial: 8, lazy_batch: 6,
}

export const LAYOUT_E: LayoutConfig = {
  code: 'layout_e', name: '极简布局', description: '无轮播无广告，加载最快',
  play_count: 50, ad_count: 0, cat_count: 0,
  ad_interval: 0, cat_positions: [],
  lazy_initial: 15, lazy_batch: 10,
}

export const LAYOUT_LIBRARY: Record<string, LayoutConfig> = {
  layout_a: LAYOUT_A,
  layout_b: LAYOUT_B,
  layout_c: LAYOUT_C,
  layout_d: LAYOUT_D,
  layout_e: LAYOUT_E,
}

// ─── 组件定义表（组件编码→元数据）────────────────────────────────────────

export const COMPONENT_DEFINITIONS: Record<string, { name: string; level: string; fixed: boolean }> = {
  logo:                { name: 'Logo组件',      level: 'L1', fixed: true  },
  result_board:        { name: '开奖组件',      level: 'L1', fixed: true  },
  banner_slider:       { name: '轮播图组件',    level: 'L1', fixed: false },
  lottery_switch:      { name: '采种切换组件',  level: 'L1', fixed: true  },
  bottom_nav:          { name: '底部导航组件',  level: 'L1', fixed: true  },
  play_card:           { name: '玩法卡片',      level: 'L2', fixed: false },
  multi_period_play:   { name: '多期玩法组件',  level: 'L2', fixed: false },
  category_entry:      { name: '栏目入口组件',  level: 'L2', fixed: false },
  statistics_card:     { name: '统计组件',      level: 'L2', fixed: false },
  history_result:      { name: '开奖历史组件',  level: 'L3', fixed: false },
  attribute_detail:    { name: '属性详情组件',  level: 'L3', fixed: false },
  notice_board:        { name: '公告组件',      level: 'L3', fixed: false },
  service_box:         { name: '客服组件',      level: 'L3', fixed: false },
  image_ad:            { name: '图片广告',      level: 'L4', fixed: false },
  text_ad:             { name: '文字广告',      level: 'L4', fixed: false },
  popup_ad:            { name: '弹窗广告',      level: 'L4', fixed: false },
  home_container:      { name: '首页容器',      level: 'L5', fixed: true  },
  statistics_container:{ name: '统计页容器',    level: 'L5', fixed: false },
  result_container:    { name: '开奖页容器',    level: 'L5', fixed: false },
}
