import { StatisticsEngine, StatisticsSummary } from './statistics.engine'
import { SettlementResult } from '../settlement/settlement.engine'

function makeRecords(pattern: Array<'H'|'M'|'N'>): SettlementResult[] {
  return pattern.map((p, i) => ({
    period:      `2026${String(i+1).padStart(3,'0')}`,
    prediction:  ['马'],
    hit:         p === 'H',
    status:      p === 'H' ? 'HIT' : p === 'N' ? 'HIDDEN' : 'MISS',
    miss_streak: 0,
    hit_streak:  0,
  }))
}

describe('StatisticsEngine - 命中率', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('calcRate: 0/0 = 0', () => expect(engine.calcRate(0, 0)).toBe(0))
  it('calcRate: 1/1 = 100', () => expect(engine.calcRate(1, 1)).toBe(100))
  it('calcRate: 63/100 = 63', () => expect(engine.calcRate(63, 100)).toBe(63))
  it('calcRate: 7/10 = 70', () => expect(engine.calcRate(7, 10)).toBe(70))
  it('calcRate: 2/3 = 66.67', () => expect(engine.calcRate(2, 3)).toBe(66.67))
  it('calcRate: 保留两位小数', () => {
    const r = engine.calcRate(1, 3)
    expect(r.toString()).toMatch(/^\d+\.\d{1,2}$|^\d+$/)
  })
})

describe('StatisticsEngine - 总统计', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('10中6 → hit_rate=60', () => {
    const records = makeRecords(['H','H','H','H','H','H','M','M','M','M'])
    const s = engine.calculate(records)
    expect(s.total_count).toBe(10)
    expect(s.hit_count).toBe(6)
    expect(s.miss_count).toBe(4)
    expect(s.hit_rate).toBe(60)
  })

  it('HIDDEN 不计入统计', () => {
    const records = makeRecords(['H','H','N','N','M'])
    const s = engine.calculate(records)
    expect(s.total_count).toBe(3)  // 2H + 1M，2N不算
    expect(s.hidden_count).toBe(2)
  })

  it('空记录 → 全零', () => {
    const s = engine.calculate([])
    expect(s.total_count).toBe(0)
    expect(s.hit_rate).toBe(0)
  })
})

describe('StatisticsEngine - 近 N 期统计', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('近10期: 最后10条中7中3 → rate=70', () => {
    // 50条记录，最后10条: 7HIT + 3MISS
    const all = makeRecords(Array(40).fill('M').concat(Array(7).fill('H'), Array(3).fill('M')) as any)
    const s = engine.calculate(all)
    expect(s.last_10.hit_count).toBe(7)
    expect(s.last_10.miss_count).toBe(3)
    expect(s.last_10.hit_rate).toBe(70)
  })

  it('近30期统计正确', () => {
    const all = makeRecords(Array(20).fill('M').concat(Array(18).fill('H'), Array(12).fill('M')) as any)
    const s = engine.calculate(all)
    expect(s.last_30.hit_count).toBe(18)
    expect(s.last_30.hit_rate).toBe(60)
  })

  it('不足10期时，total=实际条数', () => {
    const records = makeRecords(['H','H','M'])
    const s = engine.calculate(records)
    expect(s.last_10.total).toBe(3)
    expect(s.last_10.hit_rate).toBeCloseTo(66.67, 1)
  })
})

describe('StatisticsEngine - 连中/连错统计', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('HH MISS HHH → current_hit_streak=3 best_hit_streak=3', () => {
    const records = makeRecords(['H','H','M','H','H','H'])
    const s = engine.calculate(records)
    expect(s.current_hit_streak).toBe(3)
    expect(s.best_hit_streak).toBe(3)
    expect(s.current_miss_streak).toBe(0)
  })

  it('HH MMM HH → current_miss_streak=0 best_miss_streak=3', () => {
    const records = makeRecords(['H','H','M','M','M','H','H'])
    const s = engine.calculate(records)
    expect(s.current_hit_streak).toBe(2)
    expect(s.current_miss_streak).toBe(0)
    expect(s.best_miss_streak).toBe(3)
  })

  it('连错结尾 → current_miss_streak=连错数', () => {
    const records = makeRecords(['H','M','M','M','M'])
    const s = engine.calculate(records)
    expect(s.current_miss_streak).toBe(4)
    expect(s.current_hit_streak).toBe(0)
  })

  it('全命中 → best_hit_streak=total_count', () => {
    const records = makeRecords(['H','H','H','H','H'])
    const s = engine.calculate(records)
    expect(s.best_hit_streak).toBe(5)
    expect(s.best_miss_streak).toBe(0)
  })
})

describe('StatisticsEngine - 多期玩法统计', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('5组中3组 → group_rate=60', () => {
    const results = [true, false, true, false, true]
    const s = engine.calcGroupStats(results)
    expect(s.group_total).toBe(5)
    expect(s.group_hit).toBe(3)
    expect(s.group_rate).toBe(60)
  })
})

describe('StatisticsEngine - 排行榜', () => {
  let engine: StatisticsEngine

  beforeEach(() => { engine = new StatisticsEngine() })

  it('按命中率降序排列', () => {
    const entries = [
      { play_id: 1n, play_name: '平特一肖', summary: { hit_rate: 63, last_10: { hit_rate: 70 } } as any },
      { play_id: 2n, play_name: '七肖中特', summary: { hit_rate: 68, last_10: { hit_rate: 80 } } as any },
      { play_id: 3n, play_name: '绝杀一肖', summary: { hit_rate: 55, last_10: { hit_rate: 60 } } as any },
    ]
    const ranking = engine.buildRanking(entries)
    expect(ranking[0].play_name).toBe('七肖中特')
    expect(ranking[0].rank).toBe(1)
    expect(ranking[2].play_name).toBe('绝杀一肖')
  })
})

describe('StatisticsEngine - 格式化输出', () => {
  it('format() 返回 API 标准格式', () => {
    const engine = new StatisticsEngine()
    const records = makeRecords(Array(10).fill('H').concat(Array(10).fill('M')) as any)
    const summary = engine.calculate(records)
    const output = engine.format(summary)
    expect(output).toHaveProperty('total_rate')
    expect(output).toHaveProperty('last_10_rate')
    expect(output).toHaveProperty('last_30_rate')
    expect(output).toHaveProperty('last_100_rate')
    expect(output).toHaveProperty('current_hit_streak')
    expect(output).toHaveProperty('current_miss_streak')
  })
})
