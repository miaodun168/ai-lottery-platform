import { AttributeEngine } from './attribute.engine'

// 2026马年生肖映射（与 seed.ts 完全一致）
function build2026ZodiacMap() {
  const map = new Map<number, string>()
  const order = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊']
  for (let i = 0; i < 12; i++) {
    for (let n = i + 1; n <= 49; n += 12) map.set(n, order[i])
  }
  return map
}

// 2026五行映射
function build2026ElementMap() {
  const elementMap: Record<string, string> = {
    '马': '火', '蛇': '火',
    '龙': '土', '牛': '土', '狗': '土', '羊': '土',
    '兔': '木', '虎': '木',
    '鼠': '水', '猪': '水',
    '鸡': '金', '猴': '金',
  }
  const zodiacMap = build2026ZodiacMap()
  const map = new Map<number, string>()
  zodiacMap.forEach((zodiac, num) => { map.set(num, elementMap[zodiac]) })
  return map
}

describe('AttributeEngine - 固定属性', () => {
  let engine: AttributeEngine

  beforeEach(() => { engine = new AttributeEngine() })

  // ─── 波色 ─────────────────────────────────────────────────────────────────

  describe('getWave()', () => {
    it('01 → 红波', () => expect(engine.getWave(1)).toBe('红波'))
    it('03 → 蓝波', () => expect(engine.getWave(3)).toBe('蓝波'))
    it('05 → 绿波', () => expect(engine.getWave(5)).toBe('绿波'))
    it('45 → 红波', () => expect(engine.getWave(45)).toBe('红波'))
    it('46 → 红波', () => expect(engine.getWave(46)).toBe('红波'))
    it('47 → 蓝波', () => expect(engine.getWave(47)).toBe('蓝波'))
    it('48 → 蓝波', () => expect(engine.getWave(48)).toBe('蓝波'))
    it('49 → 绿波', () => expect(engine.getWave(49)).toBe('绿波'))
    it('40 → 红波', () => expect(engine.getWave(40)).toBe('红波'))
  })

  // ─── 大小 ─────────────────────────────────────────────────────────────────

  describe('getSize()', () => {
    it('01 → 小', () => expect(engine.getSize(1)).toBe('小'))
    it('24 → 小', () => expect(engine.getSize(24)).toBe('小'))
    it('25 → 大', () => expect(engine.getSize(25)).toBe('大'))
    it('49 → 大', () => expect(engine.getSize(49)).toBe('大'))
  })

  // ─── 单双 ─────────────────────────────────────────────────────────────────

  describe('getOddEven()', () => {
    it('01 → 单', () => expect(engine.getOddEven(1)).toBe('单'))
    it('02 → 双', () => expect(engine.getOddEven(2)).toBe('双'))
    it('49 → 单', () => expect(engine.getOddEven(49)).toBe('单'))
    it('48 → 双', () => expect(engine.getOddEven(48)).toBe('双'))
  })

  // ─── 合单双 ───────────────────────────────────────────────────────────────

  describe('getSumOddEven()', () => {
    it('29: 2+9=11 → 合单', () => expect(engine.getSumOddEven(29)).toBe('合单'))
    it('28: 2+8=10 → 合双', () => expect(engine.getSumOddEven(28)).toBe('合双'))
    it('10: 1+0=1  → 合单', () => expect(engine.getSumOddEven(10)).toBe('合单'))
    it('11: 1+1=2  → 合双', () => expect(engine.getSumOddEven(11)).toBe('合双'))
    it('49: 4+9=13 → 合单', () => expect(engine.getSumOddEven(49)).toBe('合单'))
  })

  // ─── 合数大小 ─────────────────────────────────────────────────────────────

  describe('getSumSize()', () => {
    it('01: 0+1=1  → 合小', () => expect(engine.getSumSize(1)).toBe('合小'))
    it('06: 0+6=6  → 合小', () => expect(engine.getSumSize(6)).toBe('合小'))
    it('07: 0+7=7  → 合大', () => expect(engine.getSumSize(7)).toBe('合大'))
    it('49: 4+9=13 → 合大', () => expect(engine.getSumSize(49)).toBe('合大'))
    it('33: 3+3=6  → 合小', () => expect(engine.getSumSize(33)).toBe('合小'))
    it('34: 3+4=7  → 合大', () => expect(engine.getSumSize(34)).toBe('合大'))
  })

  // ─── 尾大小 ───────────────────────────────────────────────────────────────

  describe('getTailSize()', () => {
    it('14: 尾4 → 小尾', () => expect(engine.getTailSize(14)).toBe('小尾'))
    it('15: 尾5 → 大尾', () => expect(engine.getTailSize(15)).toBe('大尾'))
    it('39: 尾9 → 大尾', () => expect(engine.getTailSize(39)).toBe('大尾'))
    it('40: 尾0 → 小尾', () => expect(engine.getTailSize(40)).toBe('小尾'))
  })

  // ─── 头数/尾数 ─────────────────────────────────────────────────────────────

  describe('getHead() / getTail()', () => {
    it('01 → 0头', () => expect(engine.getHead(1)).toBe('0头'))
    it('16 → 1头', () => expect(engine.getHead(16)).toBe('1头'))
    it('28 → 2头', () => expect(engine.getHead(28)).toBe('2头'))
    it('49 → 4头', () => expect(engine.getHead(49)).toBe('4头'))
    it('49 → 9尾', () => expect(engine.getTail(49)).toBe('9尾'))
    it('10 → 0尾', () => expect(engine.getTail(10)).toBe('0尾'))
    it('21 → 1尾', () => expect(engine.getTail(21)).toBe('1尾'))
  })

  // ─── 合尾 ─────────────────────────────────────────────────────────────────

  describe('getSumTail()', () => {
    it('49: 4+9=13 尾3 → 3合尾', () => expect(engine.getSumTail(49)).toBe('3合尾'))
    it('20: 2+0=2  尾2 → 2合尾', () => expect(engine.getSumTail(20)).toBe('2合尾'))
    it('19: 1+9=10 尾0 → 0合尾', () => expect(engine.getSumTail(19)).toBe('0合尾'))
  })

  // ─── 左右 ─────────────────────────────────────────────────────────────────

  describe('getLeftRight()', () => {
    it('01 → 左边', () => expect(engine.getLeftRight(1)).toBe('左边'))
    it('05 → 右边', () => expect(engine.getLeftRight(5)).toBe('右边'))
    it('49 → 右边', () => expect(engine.getLeftRight(49)).toBe('右边'))
    it('45 → 左边', () => expect(engine.getLeftRight(45)).toBe('左边'))
    it('46 → 右边', () => expect(engine.getLeftRight(46)).toBe('右边'))
  })

  // ─── 内外围 ───────────────────────────────────────────────────────────────

  describe('getInnerOuter()', () => {
    it('09 → 内围', () => expect(engine.getInnerOuter(9)).toBe('内围'))
    it('01 → 外围', () => expect(engine.getInnerOuter(1)).toBe('外围'))
    it('49 → 外围', () => expect(engine.getInnerOuter(49)).toBe('外围'))
    it('25 → 内围', () => expect(engine.getInnerOuter(25)).toBe('内围'))
    it('41 → 内围', () => expect(engine.getInnerOuter(41)).toBe('内围'))
    it('42 → 外围', () => expect(engine.getInnerOuter(42)).toBe('外围'))
  })

  // ─── 七段（行）────────────────────────────────────────────────────────────

  describe('getSevenSection()', () => {
    it('01 → 第一行', () => expect(engine.getSevenSection(1)).toBe('第一行'))
    it('07 → 第一行', () => expect(engine.getSevenSection(7)).toBe('第一行'))
    it('08 → 第二行', () => expect(engine.getSevenSection(8)).toBe('第二行'))
    it('43 → 第七行', () => expect(engine.getSevenSection(43)).toBe('第七行'))
    it('49 → 第七行', () => expect(engine.getSevenSection(49)).toBe('第七行'))
  })

  // ─── 五段 ─────────────────────────────────────────────────────────────────

  describe('getFiveSection()', () => {
    it('01 → 第一段', () => expect(engine.getFiveSection(1)).toBe('第一段'))
    it('10 → 第一段', () => expect(engine.getFiveSection(10)).toBe('第一段'))
    it('11 → 第二段', () => expect(engine.getFiveSection(11)).toBe('第二段'))
    it('41 → 第五段', () => expect(engine.getFiveSection(41)).toBe('第五段'))
    it('49 → 第五段', () => expect(engine.getFiveSection(49)).toBe('第五段'))
  })

  // ─── 半波 ─────────────────────────────────────────────────────────────────

  describe('getHalfWave()', () => {
    it('01: 红波单 → 红单', () => expect(engine.getHalfWave(1)).toBe('红单'))
    it('02: 红波双 → 红双', () => expect(engine.getHalfWave(2)).toBe('红双'))
    it('03: 蓝波单 → 蓝单', () => expect(engine.getHalfWave(3)).toBe('蓝单'))
    it('04: 蓝波双 → 蓝双', () => expect(engine.getHalfWave(4)).toBe('蓝双'))
    it('05: 绿波单 → 绿单', () => expect(engine.getHalfWave(5)).toBe('绿单'))
    it('06: 绿波双 → 绿双', () => expect(engine.getHalfWave(6)).toBe('绿双'))
    it('45: 红波单 → 红单', () => expect(engine.getHalfWave(45)).toBe('红单'))
    it('49: 绿波单 → 绿单', () => expect(engine.getHalfWave(49)).toBe('绿单'))
  })
})

describe('AttributeEngine - 动态属性（2026马年）', () => {
  let engine: AttributeEngine
  let zodiacMap: Map<number, string>
  let elementMap: Map<number, string>

  beforeEach(() => {
    engine = new AttributeEngine()
    zodiacMap = build2026ZodiacMap()
    elementMap = build2026ElementMap()
  })

  describe('生肖映射', () => {
    it('01 → 马', () => expect(zodiacMap.get(1)).toBe('马'))
    it('13 → 马', () => expect(zodiacMap.get(13)).toBe('马'))
    it('25 → 马', () => expect(zodiacMap.get(25)).toBe('马'))
    it('37 → 马', () => expect(zodiacMap.get(37)).toBe('马'))
    it('49 → 马', () => expect(zodiacMap.get(49)).toBe('马'))
    it('02 → 蛇', () => expect(zodiacMap.get(2)).toBe('蛇'))
    it('12 → 羊', () => expect(zodiacMap.get(12)).toBe('羊'))
    it('覆盖全部49个号码', () => expect(zodiacMap.size).toBe(49))
  })

  describe('五行映射', () => {
    it('01(马) → 火', () => expect(elementMap.get(1)).toBe('火'))
    it('49(马) → 火', () => expect(elementMap.get(49)).toBe('火'))
    it('02(蛇) → 火', () => expect(elementMap.get(2)).toBe('火'))
    it('03(龙) → 土', () => expect(elementMap.get(3)).toBe('土'))
    it('04(兔) → 木', () => expect(elementMap.get(4)).toBe('木'))
    it('07(鼠) → 水', () => expect(elementMap.get(7)).toBe('水'))
    it('10(鸡) → 金', () => expect(elementMap.get(10)).toBe('金'))
  })

  describe('compute() 完整属性 - 号码49', () => {
    let attrs: ReturnType<AttributeEngine['compute']>

    beforeEach(() => { attrs = engine.compute(49, zodiacMap, elementMap) })

    it('number = 49',           () => expect(attrs.number).toBe(49))
    it('wave = 绿波',            () => expect(attrs.wave).toBe('绿波'))
    it('size = 大',              () => expect(attrs.size).toBe('大'))
    it('odd_even = 单',          () => expect(attrs.odd_even).toBe('单'))
    it('sum_odd_even = 合单',    () => expect(attrs.sum_odd_even).toBe('合单'))
    it('sum_size = 合大',        () => expect(attrs.sum_size).toBe('合大'))
    it('tail_size = 大尾',       () => expect(attrs.tail_size).toBe('大尾'))
    it('head = 4头',             () => expect(attrs.head).toBe('4头'))
    it('tail = 9尾',             () => expect(attrs.tail).toBe('9尾'))
    it('left_right = 右边',      () => expect(attrs.left_right).toBe('右边'))
    it('inner_outer = 外围',     () => expect(attrs.inner_outer).toBe('外围'))
    it('seven_section = 第七行', () => expect(attrs.seven_section).toBe('第七行'))
    it('five_section = 第五段',  () => expect(attrs.five_section).toBe('第五段'))
    it('half_wave = 绿单',       () => expect(attrs.half_wave).toBe('绿单'))
    it('zodiac = 马',            () => expect(attrs.zodiac).toBe('马'))
    it('element = 火',           () => expect(attrs.element).toBe('火'))
    it('yin_yang = 阴肖',        () => expect(attrs.yin_yang).toBe('阴肖'))
    it('heaven_earth = 天肖',    () => expect(attrs.heaven_earth).toBe('天肖'))
    it('front_back = 后肖',      () => expect(attrs.front_back).toBe('后肖'))
    it('domestic_wild = 家禽',   () => expect(attrs.domestic_wild).toBe('家禽'))
    it('civil_martial = 武肖',   () => expect(attrs.civil_martial).toBe('武肖'))
    it('three_kingdoms = 蜀国',  () => expect(attrs.three_kingdoms).toBe('蜀国'))
    it('trinity = 虎马狗',       () => expect(attrs.trinity).toBe('虎马狗'))
    it('six_pair = 马羊',        () => expect(attrs.six_pair).toBe('马羊'))
  })

  describe('compute() - 号码01', () => {
    it('zodiac=马 element=火 wave=红波', () => {
      const a = engine.compute(1, zodiacMap, elementMap)
      expect(a.zodiac).toBe('马')
      expect(a.element).toBe('火')
      expect(a.wave).toBe('红波')
      expect(a.size).toBe('小')
    })
  })
})

describe('AttributeEngine - buildYearMaps()', () => {
  it('从 attribute_library 记录正确构建映射', () => {
    const engine = new AttributeEngine()
    const entries = [
      { attribute_type: 'zodiac_number', attribute_name: '马', attribute_value: JSON.stringify([1,13,25,37,49]), year: 2026 },
      { attribute_type: 'zodiac_number', attribute_name: '蛇', attribute_value: JSON.stringify([2,14,26,38]),    year: 2026 },
      { attribute_type: 'element',       attribute_name: '火', attribute_value: JSON.stringify([1,2,13,14,25,26,37,38,49]), year: 2026 },
    ]
    const { zodiacMap, elementMap } = engine.buildYearMaps(entries)
    expect(zodiacMap.get(1)).toBe('马')
    expect(zodiacMap.get(13)).toBe('马')
    expect(zodiacMap.get(2)).toBe('蛇')
    expect(elementMap.get(1)).toBe('火')
    expect(elementMap.get(49)).toBe('火')
  })
})
