import { AttributeEngine } from '../attribute/attribute.engine'
import { PlayEngine, PlayDsl } from '../play/play.engine'
import { ResultEngine } from '../result/result.engine'
import { SettlementEngine, SettlementResult } from './settlement.engine'

// ─── 测试辅助 ─────────────────────────────────────────────────────────────────

function build2026ZodiacMap() {
  const map = new Map<number, string>()
  const order = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊']
  for (let i = 0; i < 12; i++) {
    for (let n = i + 1; n <= 49; n += 12) map.set(n, order[i])
  }
  return map
}

function makeDsl(overrides: Partial<PlayDsl>): PlayDsl {
  return {
    rule_code: '20001', rule_name: '平特一肖',
    predict_type: 'attr_1', target_scope: 'pt',
    hit_mode: 'include', select_count: 1, group_size: 1,
    ...overrides,
  }
}

// 开奖: [01,13,22,35,41,46] 平码, 49 特码
// 生肖: 01=马, 13=马, 22=鸡, 35=猴, 41=虎, 46=鸡, 49=马
const NUMBERS_A = [1, 13, 22, 35, 41, 46, 49]

// 开奖: [03,15,27,39,48,12] 平码, 07 特码
// 生肖: 03=龙, 15=兔, 27=龙, 39=龙, 48=羊, 12=羊, 07=鼠
const NUMBERS_B = [3, 15, 27, 39, 48, 12, 7]

describe('SettlementEngine - 单期玩法', () => {
  let engine: SettlementEngine
  let resultEngine: ResultEngine
  const zodiacMap = build2026ZodiacMap()

  beforeEach(() => {
    const attrEngine = new AttributeEngine()
    const playEngine = new PlayEngine()
    resultEngine = new ResultEngine(attrEngine)
    engine = new SettlementEngine(attrEngine, playEngine)
  })

  // ── 平特一肖（全部7个号码，zodiac，include）───────────────────────────────

  describe('20001 平特一肖 (target_scope=pt, include, zodiac)', () => {
    const dsl = makeDsl({ predict_type: 'attr_1', target_scope: 'pt', hit_mode: 'include', select_count: 1 })

    it('预测马，开奖含马(01) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['马'], result, dsl)
      expect(sr.hit).toBe(true)
      expect(sr.status).toBe('HIT')
    })

    it('预测龙，开奖无龙 → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['龙'], result, dsl)
      expect(sr.hit).toBe(false)
      expect(sr.status).toBe('MISS')
    })

    it('预测鼠，开奖有鼠(07=鼠 in NUMBERS_B) → 命中', () => {
      const result = resultEngine.process('2026002', NUMBERS_B, zodiacMap)
      const sr = engine.settle('2026002', ['鼠'], result, dsl)
      expect(sr.hit).toBe(true)
    })
  })

  // ── 大小中特（特码，big_small，include）─────────────────────────────────────

  describe('20006 大小中特 (target_scope=t, include, size)', () => {
    const dsl = makeDsl({ rule_code: '20006', rule_name: '大小中特', predict_type: 'attr_7', target_scope: 't', hit_mode: 'include', select_count: 1 })

    it('预测大，特码49(大) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['大'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('预测小，特码49(大) → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['小'], result, dsl)
      expect(sr.hit).toBe(false)
    })

    it('预测小，特码07(小) → 命中', () => {
      const result = resultEngine.process('2026002', NUMBERS_B, zodiacMap)
      const sr = engine.settle('2026002', ['小'], result, dsl)
      expect(sr.hit).toBe(true)
    })
  })

  // ── 单双中特（特码，odd_even，include）────────────────────────────────────

  describe('20005 单双中特 (target_scope=t, include, odd_even)', () => {
    const dsl = makeDsl({ rule_code: '20005', rule_name: '单双中特', predict_type: 'attr_6', target_scope: 't', hit_mode: 'include', select_count: 1 })

    it('预测单，特码49(单) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['单'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('预测双，特码49(单) → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['双'], result, dsl)
      expect(sr.hit).toBe(false)
    })
  })

  // ── 二波中特（特码，wave，include）────────────────────────────────────────

  describe('20003 二波中特 (target_scope=t, include, wave)', () => {
    const dsl = makeDsl({ rule_code: '20003', rule_name: '二波中特', predict_type: 'attr_3', target_scope: 't', hit_mode: 'include', select_count: 2 })

    it('预测[绿波,红波]，特码49(绿波) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['绿波', '红波'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('预测[红波,蓝波]，特码49(绿波) → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['红波', '蓝波'], result, dsl)
      expect(sr.hit).toBe(false)
    })
  })

  // ── 绝杀一肖（特码，zodiac，exclude）────────────────────────────────────────

  describe('20010 绝杀一肖 (target_scope=t, exclude, zodiac)', () => {
    const dsl = makeDsl({ rule_code: '20010', rule_name: '绝杀一肖', predict_type: 'attr_1', target_scope: 't', hit_mode: 'exclude', select_count: 1 })

    it('绝杀马，特码49(马) → 未中（特码就是马）', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['马'], result, dsl)
      expect(sr.hit).toBe(false)
    })

    it('绝杀龙，特码49(马) → 命中（特码不是龙）', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['龙'], result, dsl)
      expect(sr.hit).toBe(true)
    })
  })

  // ── 绝杀五码（特码，number，exclude）─────────────────────────────────────

  describe('20004 绝杀五码 (target_scope=t, exclude, number)', () => {
    const dsl = makeDsl({ rule_code: '20004', rule_name: '绝杀五码', predict_type: 'number', target_scope: 't', hit_mode: 'exclude', select_count: 5 })

    it('绝杀[01,02,03,04,05]，特码49 → 命中（49不在绝杀列表）', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['1','2','3','4','5'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('绝杀含49，特码49 → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['49','02','03','04','05'], result, dsl)
      expect(sr.hit).toBe(false)
    })
  })

  // ── 七肖中特（特码，zodiac，include，7肖）───────────────────────────────────

  describe('20014 七肖中特 (target_scope=t, include, zodiac, count=7)', () => {
    const dsl = makeDsl({ rule_code: '20014', rule_name: '七肖中特', predict_type: 'attr_1', target_scope: 't', hit_mode: 'include', select_count: 7 })

    it('7肖含马，特码49(马) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['马','牛','虎','兔','龙','蛇','羊'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('7肖不含马，特码49(马) → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['牛','虎','兔','龙','蛇','羊','猴'], result, dsl)
      expect(sr.hit).toBe(false)
    })
  })

  // ── 家禽野兽（特码，attr_5，include）────────────────────────────────────────

  describe('20016 家禽野兽 (target_scope=t, include, attr_5)', () => {
    const dsl = makeDsl({ rule_code: '20016', rule_name: '家禽野兽', predict_type: 'attr_5', target_scope: 't', hit_mode: 'include', select_count: 1 })

    it('预测家禽，特码49(马=家禽) → 命中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['家禽'], result, dsl)
      expect(sr.hit).toBe(true)
    })

    it('预测野兽，特码49(马=家禽) → 未中', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr = engine.settle('2026001', ['野兽'], result, dsl)
      expect(sr.hit).toBe(false)
    })
  })

  // ── 连错/连中统计 ────────────────────────────────────────────────────────

  describe('连错统计', () => {
    const dsl = makeDsl({ predict_type: 'attr_7', target_scope: 't', hit_mode: 'include' })

    it('连续两次未中后 miss_streak=2', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap) // 特码49=大
      const sr1 = engine.settle('2026001', ['小'], result, dsl, 0, 0)
      const sr2 = engine.settle('2026002', ['小'], result, dsl, sr1.miss_streak, sr1.hit_streak)
      expect(sr2.miss_streak).toBe(2)
      expect(sr2.hit_streak).toBe(0)
    })

    it('命中后 miss_streak 清零', () => {
      const result = resultEngine.process('2026001', NUMBERS_A, zodiacMap)
      const sr1 = engine.settle('2026001', ['小'], result, dsl, 0, 0)
      const sr2 = engine.settle('2026002', ['大'], result, dsl, sr1.miss_streak, sr1.hit_streak)
      expect(sr2.miss_streak).toBe(0)
      expect(sr2.hit_streak).toBe(1)
    })
  })
})

describe('SettlementEngine - 多期玩法（30001 三期三肖）', () => {
  let engine: SettlementEngine
  let resultEngine: ResultEngine
  const zodiacMap = build2026ZodiacMap()

  beforeEach(() => {
    const attrEngine = new AttributeEngine()
    const playEngine = new PlayEngine()
    resultEngine = new ResultEngine(attrEngine)
    engine = new SettlementEngine(attrEngine, playEngine)
  })

  // 三期三肖：pt scope，任意一期命中算整组命中
  const dsl = makeDsl({
    rule_code: '30001', rule_name: '三期三肖',
    predict_type: 'attr_1', target_scope: 'pt',
    hit_mode: 'include', select_count: 3, group_size: 3,
  })

  it('三期内第二期命中 → 整组命中', () => {
    // 期120: NUMBERS_B (特码07=鼠), 期121: NUMBERS_A (特码49=马), 期122: NUMBERS_B (特码07=鼠)
    const inputs = [
      { period: '2026120', prediction: ['马','羊','猴'], result: resultEngine.process('2026120', NUMBERS_B, zodiacMap) },
      { period: '2026121', prediction: ['马','羊','猴'], result: resultEngine.process('2026121', NUMBERS_A, zodiacMap) }, // 马 命中
      { period: '2026122', prediction: ['马','羊','猴'], result: resultEngine.process('2026122', NUMBERS_B, zodiacMap) },
    ]
    const r = engine.settleMultiPeriod(inputs, dsl)
    expect(r.group_hit).toBe(true)
    expect(r.periods[1].hit).toBe(true)
  })

  it('三期全未命中 → 整组未命中', () => {
    const inputs = [
      { period: '2026120', prediction: ['龙','虎','鼠'], result: resultEngine.process('2026120', NUMBERS_A, zodiacMap) },
      { period: '2026121', prediction: ['龙','虎','鼠'], result: resultEngine.process('2026121', NUMBERS_B, zodiacMap) },
      { period: '2026122', prediction: ['龙','虎','鼠'], result: resultEngine.process('2026122', NUMBERS_A, zodiacMap) },
    ]
    // NUMBERS_A 含 马鸡鸡猴虎鸡马；NUMBERS_B 含 龙兔龙龙羊羊鼠
    // 预测[龙虎鼠]: NUMBERS_B特码=07(鼠) → 实际命中！需调整预测避免命中
    // 改用 [猪,蛇,猴] 来确保NUMBERS_A和NUMBERS_B都不命中
    const inputs2 = [
      { period: '2026120', prediction: ['蛇','猪','狗'], result: resultEngine.process('2026120', NUMBERS_A, zodiacMap) },
      { period: '2026121', prediction: ['蛇','猪','狗'], result: resultEngine.process('2026121', NUMBERS_B, zodiacMap) },
      { period: '2026122', prediction: ['蛇','猪','狗'], result: resultEngine.process('2026122', NUMBERS_A, zodiacMap) },
    ]
    // NUMBERS_A: 01(马),13(马),22(鸡),35(猴),41(虎),46(鸡),49(马) → 无蛇猪狗
    // NUMBERS_B: 03(龙),15(兔),27(龙),39(龙),48(羊),12(羊),07(鼠) → 无蛇猪狗
    const r2 = engine.settleMultiPeriod(inputs2, dsl)
    expect(r2.group_hit).toBe(false)
    expect(r2.periods.every(p => !p.hit)).toBe(true)
  })
})

describe('SettlementEngine - 隐藏规则', () => {
  let engine: SettlementEngine

  beforeEach(() => {
    engine = new SettlementEngine(new AttributeEngine(), new PlayEngine())
  })

  function makeRecords(statuses: Array<'HIT'|'MISS'>): SettlementResult[] {
    return statuses.map((status, i) => ({
      period: `2026${String(i+1).padStart(3,'0')}`,
      prediction: ['马'],
      hit: status === 'HIT',
      status,
      miss_streak: 0,
      hit_streak:  0,
    }))
  }

  it('连错 < 3 不触发隐藏', () => {
    const records = makeRecords(['HIT','MISS','MISS'])
    const result = engine.applyHideRule(records, 3)
    expect(result.every(r => r.status !== 'HIDDEN')).toBe(true)
  })

  it('连错 = 3 时，触发隐藏：前面所有记录变HIDDEN', () => {
    // HIT HIT MISS MISS MISS
    const records = makeRecords(['HIT','HIT','MISS','MISS','MISS'])
    const result = engine.applyHideRule(records, 3)
    // 从第3个MISS开始连错达到3，隐藏第0个(HIT之前的部分)
    // 连错索引: 2,3,4 = 连错3期，hideFromIdx = 2-(3-1) = 0
    // 索引0,1 (HIT,HIT) 前面全部隐藏
    expect(result[0].status).toBe('HIDDEN')
    expect(result[1].status).toBe('HIDDEN')
    expect(result[2].status).toBe('MISS')
    expect(result[3].status).toBe('MISS')
    expect(result[4].status).toBe('MISS')
  })

  it('命中后 miss_streak 重置，再次连错才触发新一轮隐藏', () => {
    const records = makeRecords(['MISS','MISS','MISS','HIT','MISS','MISS','MISS'])
    const result = engine.applyHideRule(records, 3)
    // 第一段连错3(0-2) 无前史可隐 (hideFromIdx=0，j<0无效)
    // 第二段连错3(4-6) hideFromIdx=4，j<4全隐 → 包括HIT(3)和前面3个MISS
    expect(result[3].status).toBe('HIDDEN')  // HIT被隐藏
    expect(result[4].status).toBe('MISS')    // 第二段连错
    expect(result[5].status).toBe('MISS')
    expect(result[6].status).toBe('MISS')
  })
})
