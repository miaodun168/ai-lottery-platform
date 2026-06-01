import { Injectable } from '@nestjs/common'
import {
  WAVE_RED, WAVE_BLUE, WAVE_GREEN,
  LEFT_SIDE, INNER_ZONE,
  SEVEN_SEGMENTS, FIVE_SEGMENTS,
  ZODIAC_YIN, ZODIAC_YANG,
  ZODIAC_HEAVEN, ZODIAC_EARTH,
  ZODIAC_FRONT, ZODIAC_BACK,
  ZODIAC_DOMESTIC, ZODIAC_WILD,
  ZODIAC_CIVIL, ZODIAC_MARTIAL,
  THREE_KINGDOMS, TRINITY_GROUPS, SIX_PAIR_MAP,
} from './attribute.constants'
import { NumberAttributes, ZodiacYearMap, ElementYearMap } from './attribute.types'

@Injectable()
export class AttributeEngine {

  // ─── 波色 ─────────────────────────────────────────────────────────────────

  getWave(n: number): '红波' | '蓝波' | '绿波' {
    if (WAVE_RED.has(n))   return '红波'
    if (WAVE_BLUE.has(n))  return '蓝波'
    return '绿波'
  }

  // ─── 大小（01-24=小 25-49=大）────────────────────────────────────────────

  getSize(n: number): '大' | '小' {
    return n >= 25 ? '大' : '小'
  }

  // ─── 单双 ─────────────────────────────────────────────────────────────────

  getOddEven(n: number): '单' | '双' {
    return n % 2 !== 0 ? '单' : '双'
  }

  // ─── 合单双：各位数字之和奇偶 ─────────────────────────────────────────────

  getSumOddEven(n: number): '合单' | '合双' {
    const s = this.digitSum(n)
    return s % 2 !== 0 ? '合单' : '合双'
  }

  // ─── 合数大小：各位数字之和 0-6=合小 7+=合大 ──────────────────────────────

  getSumSize(n: number): '合大' | '合小' {
    return this.digitSum(n) <= 6 ? '合小' : '合大'
  }

  // ─── 尾大小：尾数 0-4=小尾 5-9=大尾 ──────────────────────────────────────

  getTailSize(n: number): '大尾' | '小尾' {
    return (n % 10) >= 5 ? '大尾' : '小尾'
  }

  // ─── 头数 ─────────────────────────────────────────────────────────────────

  getHead(n: number): string {
    return `${Math.floor(n / 10)}头`
  }

  // ─── 尾数 ─────────────────────────────────────────────────────────────────

  getTail(n: number): string {
    return `${n % 10}尾`
  }

  // ─── 合尾：各位数字之和的个位 ─────────────────────────────────────────────

  getSumTail(n: number): string {
    return `${this.digitSum(n) % 10}合尾`
  }

  // ─── 左右 ─────────────────────────────────────────────────────────────────

  getLeftRight(n: number): '左边' | '右边' {
    return LEFT_SIDE.has(n) ? '左边' : '右边'
  }

  // ─── 内外围 ───────────────────────────────────────────────────────────────

  getInnerOuter(n: number): '内围' | '外围' {
    return INNER_ZONE.has(n) ? '内围' : '外围'
  }

  // ─── 七段（行）────────────────────────────────────────────────────────────

  getSevenSection(n: number): string {
    for (const [label, lo, hi] of SEVEN_SEGMENTS) {
      if (n >= lo && n <= hi) return label
    }
    return '第七行'
  }

  // ─── 五段 ─────────────────────────────────────────────────────────────────

  getFiveSection(n: number): string {
    for (const [label, lo, hi] of FIVE_SEGMENTS) {
      if (n >= lo && n <= hi) return label
    }
    return '第五段'
  }

  // ─── 半波（波色+单双）────────────────────────────────────────────────────

  getHalfWave(n: number): string {
    const color = this.getWave(n).replace('波', '')
    return `${color}${this.getOddEven(n) === '单' ? '单' : '双'}`
  }

  // ─── 生肖固定属性（不受年份影响）────────────────────────────────────────

  getZodiacAttributes(zodiac: string): Partial<NumberAttributes> {
    const result: Partial<NumberAttributes> = {}

    result.yin_yang      = ZODIAC_YIN.has(zodiac) ? '阴肖' : '阳肖'
    result.heaven_earth  = ZODIAC_HEAVEN.has(zodiac) ? '天肖' : '地肖'
    result.front_back    = ZODIAC_FRONT.has(zodiac) ? '前肖' : '后肖'
    result.domestic_wild = ZODIAC_DOMESTIC.has(zodiac) ? '家禽' : '野兽'
    result.civil_martial = ZODIAC_CIVIL.has(zodiac) ? '文肖' : '武肖'
    result.six_pair      = SIX_PAIR_MAP[zodiac] || zodiac

    for (const [kingdom, members] of Object.entries(THREE_KINGDOMS)) {
      if (members.includes(zodiac)) { result.three_kingdoms = kingdom; break }
    }

    for (const group of TRINITY_GROUPS) {
      if (group.includes(zodiac)) { result.trinity = group.join(''); break }
    }

    return result
  }

  // ─── 核心：计算一个号码的全部属性 ────────────────────────────────────────

  compute(
    n: number,
    zodiacMap?: ZodiacYearMap,
    elementMap?: ElementYearMap,
  ): NumberAttributes {
    const base: NumberAttributes = {
      number:        n,
      wave:          this.getWave(n),
      size:          this.getSize(n),
      odd_even:      this.getOddEven(n),
      sum_odd_even:  this.getSumOddEven(n),
      sum_size:      this.getSumSize(n),
      tail_size:     this.getTailSize(n),
      head:          this.getHead(n),
      tail:          this.getTail(n),
      sum_tail:      this.getSumTail(n),
      left_right:    this.getLeftRight(n),
      inner_outer:   this.getInnerOuter(n),
      seven_section: this.getSevenSection(n),
      five_section:  this.getFiveSection(n),
      half_wave:     this.getHalfWave(n),
    }

    if (zodiacMap) {
      const zodiac = zodiacMap.get(n)
      if (zodiac) {
        base.zodiac = zodiac
        base.element = elementMap?.get(n)
        Object.assign(base, this.getZodiacAttributes(zodiac))
      }
    }

    return base
  }

  // ─── 批量计算（整期开奖结果）─────────────────────────────────────────────

  computeAll(
    numbers: number[],
    zodiacMap?: ZodiacYearMap,
    elementMap?: ElementYearMap,
  ): NumberAttributes[] {
    return numbers.map(n => this.compute(n, zodiacMap, elementMap))
  }

  // ─── 从 attribute_library 记录构建年份映射 ────────────────────────────────

  buildYearMaps(entries: Array<{ attribute_type: string; attribute_name: string; attribute_value: string; year: number }>): {
    zodiacMap: ZodiacYearMap
    elementMap: ElementYearMap
  } {
    const zodiacMap: ZodiacYearMap = new Map()
    const elementMap: ElementYearMap = new Map()

    for (const e of entries) {
      const numbers: number[] = JSON.parse(e.attribute_value)
      if (e.attribute_type === 'zodiac_number') {
        for (const n of numbers) zodiacMap.set(n, e.attribute_name)
      } else if (e.attribute_type === 'element') {
        for (const n of numbers) elementMap.set(n, e.attribute_name)
      }
    }

    return { zodiacMap, elementMap }
  }

  // ─── 根据 predict_type 取对应属性值 ──────────────────────────────────────

  getAttrByPredictType(attrs: NumberAttributes, predictType: string): string {
    switch (predictType) {
      case 'number':    return String(attrs.number)
      case 'number_1':  return attrs.head
      case 'number_2':  return attrs.tail
      case 'attr_1':    return attrs.zodiac ?? ''
      case 'attr_2':    return attrs.seven_section
      case 'attr_3':    return attrs.wave
      case 'attr_5':    return [attrs.domestic_wild, attrs.civil_martial, attrs.front_back, attrs.yin_yang, attrs.heaven_earth, attrs.three_kingdoms].filter(Boolean).join(',')
      case 'attr_6':    return attrs.odd_even
      case 'attr_7':    return attrs.size
      case 'attr_9':    return attrs.five_section
      case 'attr_11':   return `${attrs.half_wave},${attrs.sum_odd_even},${attrs.sum_size}`
      default:          return ''
    }
  }

  // ─── 检查一个预测值是否命中某个属性值集合 ────────────────────────────────

  matchAttr(prediction: string, attrValue: string): boolean {
    return attrValue.split(',').some(v => v.trim() === prediction)
  }

  // ─── 私有：各位数字之和 ───────────────────────────────────────────────────

  private digitSum(n: number): number {
    return String(n).split('').reduce((s, d) => s + parseInt(d), 0)
  }
}
