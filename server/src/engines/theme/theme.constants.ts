export interface ThemeColors {
  primary:    string
  secondary:  string
  success:    string
  danger:     string
  warning:    string
  background: string
  surface:    string
  text:       string
  text_muted: string
  border:     string
}

export interface ThemeTypography {
  font_family: string
  h1: number; h2: number; h3: number
  body: number; small: number; tiny: number
}

export interface ThemeRadius {
  none: number; small: number; medium: number; large: number; round: number
  card: number; button: number
}

export interface ThemeShadow {
  none: string; small: string; medium: string; large: string
}

export interface ThemeConfig {
  theme_code:  string
  name:        string
  description: string
  colors:      ThemeColors
  typography:  ThemeTypography
  radius:      ThemeRadius
  shadow:      ThemeShadow
  animation:   'fade' | 'slide' | 'zoom' | 'bounce' | 'none'
  button:      { height: number; font_size: number }
  mobile:      { card_radius: number; font_scale: number; spacing: number }
  play_card:   { style: string }
  result_board:{ style: string }
}

// ─── T001 默认主题（白底蓝色）──────────────────────────────────────────────

export const THEME_DEFAULT: ThemeConfig = {
  theme_code: 'theme_default', name: '默认主题', description: '简洁白底蓝色风格',
  colors: { primary:'#1677FF', secondary:'#0958D9', success:'#52C41A', danger:'#FF4D4F', warning:'#FAAD14', background:'#F5F5F5', surface:'#FFFFFF', text:'#1F1F1F', text_muted:'#8C8C8C', border:'#D9D9D9' },
  typography: { font_family:'PingFang SC, Microsoft YaHei, sans-serif', h1:28, h2:22, h3:18, body:16, small:14, tiny:12 },
  radius: { none:0, small:4, medium:8, large:16, round:999, card:8, button:6 },
  shadow: { none:'none', small:'0 2px 4px rgba(0,0,0,.06)', medium:'0 4px 12px rgba(0,0,0,.10)', large:'0 8px 24px rgba(0,0,0,.14)' },
  animation: 'fade', button: { height:42, font_size:14 }, mobile: { card_radius:10, font_scale:1, spacing:8 },
  play_card: { style:'card_01' }, result_board: { style:'classic' },
}

// ─── T002 红金主题 ─────────────────────────────────────────────────────────

export const THEME_RED_GOLD: ThemeConfig = {
  theme_code: 'theme_red_gold', name: '红金主题', description: '红色金色节日风格',
  colors: { primary:'#C62828', secondary:'#FFD700', success:'#22C55E', danger:'#EF4444', warning:'#F59E0B', background:'#FFF8E1', surface:'#FFFFFF', text:'#111827', text_muted:'#9CA3AF', border:'#FBBF24' },
  typography: { font_family:'PingFang SC, Microsoft YaHei, sans-serif', h1:28, h2:22, h3:18, body:16, small:14, tiny:12 },
  radius: { none:0, small:4, medium:8, large:16, round:999, card:12, button:8 },
  shadow: { none:'none', small:'0 2px 6px rgba(198,40,40,.12)', medium:'0 4px 16px rgba(198,40,40,.18)', large:'0 8px 32px rgba(198,40,40,.22)' },
  animation: 'fade', button: { height:44, font_size:15 }, mobile: { card_radius:12, font_scale:1, spacing:10 },
  play_card: { style:'card_03' }, result_board: { style:'ball' },
}

// ─── T003 科技主题（深色科技蓝）───────────────────────────────────────────

export const THEME_TECH: ThemeConfig = {
  theme_code: 'theme_tech', name: '科技主题', description: '深色科技蓝发光效果',
  colors: { primary:'#00BFFF', secondary:'#0288D1', success:'#00E676', danger:'#FF5252', warning:'#FFD740', background:'#0A192F', surface:'#112240', text:'#E6F1FF', text_muted:'#8892B0', border:'#1D3461' },
  typography: { font_family:'Rajdhani, PingFang SC, sans-serif', h1:30, h2:24, h3:20, body:16, small:14, tiny:12 },
  radius: { none:0, small:2, medium:6, large:12, round:999, card:6, button:4 },
  shadow: { none:'none', small:'0 2px 8px rgba(0,191,255,.15)', medium:'0 4px 20px rgba(0,191,255,.25)', large:'0 0 40px rgba(0,191,255,.35)' },
  animation: 'slide', button: { height:42, font_size:14 }, mobile: { card_radius:8, font_scale:0.95, spacing:8 },
  play_card: { style:'card_02' }, result_board: { style:'digital' },
}

// ─── T004 暗黑主题 ─────────────────────────────────────────────────────────

export const THEME_DARK: ThemeConfig = {
  theme_code: 'theme_dark', name: '暗黑主题', description: '深色背景极简风格',
  colors: { primary:'#7C3AED', secondary:'#5B21B6', success:'#059669', danger:'#DC2626', warning:'#D97706', background:'#18181B', surface:'#27272A', text:'#F4F4F5', text_muted:'#71717A', border:'#3F3F46' },
  typography: { font_family:'PingFang SC, Microsoft YaHei, sans-serif', h1:28, h2:22, h3:18, body:16, small:14, tiny:12 },
  radius: { none:0, small:4, medium:8, large:16, round:999, card:10, button:6 },
  shadow: { none:'none', small:'0 2px 8px rgba(0,0,0,.4)', medium:'0 4px 16px rgba(0,0,0,.5)', large:'0 8px 32px rgba(0,0,0,.6)' },
  animation: 'none', button: { height:40, font_size:14 }, mobile: { card_radius:10, font_scale:1, spacing:8 },
  play_card: { style:'card_02' }, result_board: { style:'minimal' },
}

// ─── T005 商务主题 ─────────────────────────────────────────────────────────

export const THEME_BUSINESS: ThemeConfig = {
  theme_code: 'theme_business', name: '商务主题', description: '专业灰黑商务风格',
  colors: { primary:'#374151', secondary:'#6B7280', success:'#10B981', danger:'#EF4444', warning:'#F59E0B', background:'#F9FAFB', surface:'#FFFFFF', text:'#111827', text_muted:'#6B7280', border:'#E5E7EB' },
  typography: { font_family:'PingFang SC, Microsoft YaHei, sans-serif', h1:26, h2:20, h3:17, body:15, small:13, tiny:11 },
  radius: { none:0, small:2, medium:4, large:8, round:999, card:4, button:4 },
  shadow: { none:'none', small:'0 1px 3px rgba(0,0,0,.08)', medium:'0 4px 6px rgba(0,0,0,.07)', large:'0 10px 15px rgba(0,0,0,.06)' },
  animation: 'none', button: { height:40, font_size:14 }, mobile: { card_radius:6, font_scale:1, spacing:6 },
  play_card: { style:'card_04' }, result_board: { style:'table' },
}

// ─── T006 极简主题 ─────────────────────────────────────────────────────────

export const THEME_MINIMAL: ThemeConfig = {
  theme_code: 'theme_minimal', name: '极简主题', description: '留白无边框轻量化',
  colors: { primary:'#3B82F6', secondary:'#93C5FD', success:'#86EFAC', danger:'#FCA5A5', warning:'#FDE68A', background:'#FFFFFF', surface:'#FAFAFA', text:'#1F2937', text_muted:'#9CA3AF', border:'transparent' },
  typography: { font_family:'PingFang SC, -apple-system, sans-serif', h1:26, h2:20, h3:17, body:15, small:13, tiny:11 },
  radius: { none:0, small:6, medium:12, large:20, round:999, card:16, button:20 },
  shadow: { none:'none', small:'none', medium:'0 2px 8px rgba(0,0,0,.04)', large:'0 4px 16px rgba(0,0,0,.06)' },
  animation: 'fade', button: { height:44, font_size:15 }, mobile: { card_radius:16, font_scale:1, spacing:12 },
  play_card: { style:'card_01' }, result_board: { style:'minimal' },
}

export const THEME_LIBRARY: Record<string, ThemeConfig> = {
  theme_default:  THEME_DEFAULT,
  theme_red_gold: THEME_RED_GOLD,
  theme_tech:     THEME_TECH,
  theme_dark:     THEME_DARK,
  theme_business: THEME_BUSINESS,
  theme_minimal:  THEME_MINIMAL,
}
