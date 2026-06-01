export interface NumberAttributes {
  number:       number
  wave:         '红波' | '蓝波' | '绿波'
  size:         '大' | '小'
  odd_even:     '单' | '双'
  sum_odd_even: '合单' | '合双'
  sum_size:     '合大' | '合小'
  tail_size:    '大尾' | '小尾'
  head:         string   // '0头'~'4头'
  tail:         string   // '0尾'~'9尾'
  sum_tail:     string   // '0合尾'~'9合尾'
  left_right:   '左边' | '右边'
  inner_outer:  '内围' | '外围'
  seven_section: string  // '第一行'~'第七行'
  five_section:  string  // '第一段'~'第五段'
  half_wave:    string   // '红单'|'红双'|'蓝单'|'蓝双'|'绿单'|'绿双'
  // ── 动态（需传入年份映射）
  zodiac?:       string
  element?:      string
  // ── 生肖固定属性（有 zodiac 才有这些）
  yin_yang?:     '阴肖' | '阳肖'
  heaven_earth?: '天肖' | '地肖'
  front_back?:   '前肖' | '后肖'
  domestic_wild?: '家禽' | '野兽'
  civil_martial?: '文肖' | '武肖'
  three_kingdoms?: string
  trinity?:      string
  six_pair?:     string
}

export type ZodiacYearMap = Map<number, string>   // number → zodiac
export type ElementYearMap = Map<number, string>  // number → element
