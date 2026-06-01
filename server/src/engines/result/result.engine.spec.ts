import { AttributeEngine } from '../attribute/attribute.engine'
import { ResultEngine } from './result.engine'

function build2026ZodiacMap() {
  const map = new Map<number, string>()
  const order = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊']
  for (let i = 0; i < 12; i++) {
    for (let n = i + 1; n <= 49; n += 12) map.set(n, order[i])
  }
  return map
}

describe('ResultEngine - validate()', () => {
  let engine: ResultEngine

  beforeEach(() => { engine = new ResultEngine(new AttributeEngine()) })

  it('7个有效号码 → valid=true', () => {
    const r = engine.validate([1,12,18,22,31,44,49])
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('少于7个号码 → 报错', () => {
    const r = engine.validate([1,2,3,4,5,6])
    expect(r.valid).toBe(false)
    expect(r.errors[0]).toContain('7个')
  })

  it('号码超出范围（0）→ 报错', () => {
    const r = engine.validate([0,12,18,22,31,44,49])
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.includes('超出范围'))).toBe(true)
  })

  it('号码超出范围（50）→ 报错', () => {
    const r = engine.validate([1,12,18,22,31,44,50])
    expect(r.valid).toBe(false)
  })

  it('重复号码 → 报错', () => {
    const r = engine.validate([1,1,18,22,31,44,49])
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.includes('重复'))).toBe(true)
  })
})

describe('ResultEngine - process()', () => {
  let engine: ResultEngine
  const zodiacMap = build2026ZodiacMap()
  const NUMBERS = [1, 13, 22, 35, 41, 46, 49]

  beforeEach(() => { engine = new ResultEngine(new AttributeEngine()) })

  it('正确分离平码和特码', () => {
    const result = engine.process('2026001', NUMBERS, zodiacMap)
    expect(result.normalNums).toEqual([1,13,22,35,41,46])
    expect(result.specialNum).toBe(49)
    expect(result.numbers).toHaveLength(7)
  })

  it('生成7个号码的属性快照', () => {
    const result = engine.process('2026001', NUMBERS, zodiacMap)
    expect(result.attributes).toHaveLength(7)
  })

  it('特码49属性正确', () => {
    const result = engine.process('2026001', NUMBERS, zodiacMap)
    const special = engine.getSpecialAttributes(result)
    expect(special.number).toBe(49)
    expect(special.zodiac).toBe('马')
    expect(special.size).toBe('大')
    expect(special.wave).toBe('绿波')
  })

  it('非法号码抛出异常', () => {
    expect(() => engine.process('2026001', [1,2,3,4,5,6,50])).toThrow('验证失败')
  })
})
