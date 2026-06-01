import { PlayEngine, PlayDsl } from './play.engine'

describe('PlayEngine - DSL解析', () => {
  let engine: PlayEngine

  beforeEach(() => { engine = new PlayEngine() })

  it('parseDsl() 正确解析 JSON', () => {
    const json = JSON.stringify({
      rule_code: '20001', rule_name: '平特一肖',
      predict_type: 'attr_1', target_scope: 'pt',
      hit_mode: 'include', select_count: 1, group_size: 1, version: 'v1.0',
    })
    const dsl = engine.parseDsl(json)
    expect(dsl.rule_code).toBe('20001')
    expect(dsl.rule_name).toBe('平特一肖')
    expect(dsl.predict_type).toBe('attr_1')
    expect(dsl.target_scope).toBe('pt')
    expect(dsl.hit_mode).toBe('include')
    expect(dsl.select_count).toBe(1)
    expect(dsl.group_size).toBe(1)
  })

  it('parseDsl() 三期三肖', () => {
    const dsl = engine.parseDsl(JSON.stringify({
      rule_code: '30001', rule_name: '三期三肖',
      predict_type: 'attr_1', target_scope: 'pt',
      hit_mode: 'include', select_count: 3, group_size: 3,
    }))
    expect(dsl.group_size).toBe(3)
  })
})

describe('PlayEngine - selectTargetNums()', () => {
  let engine: PlayEngine
  const NUMS = [1, 13, 22, 35, 41, 46, 49]

  beforeEach(() => { engine = new PlayEngine() })

  it('scope=pt → 全部7个', () => {
    const { targetNums } = engine.selectTargetNums(NUMS, 'pt')
    expect(targetNums).toEqual(NUMS)
  })

  it('scope=t → 仅特码[49]', () => {
    const { targetNums, specialNum } = engine.selectTargetNums(NUMS, 't')
    expect(targetNums).toEqual([49])
    expect(specialNum).toBe(49)
  })

  it('scope=p → 仅平码6个', () => {
    const { targetNums, normalNums } = engine.selectTargetNums(NUMS, 'p')
    expect(targetNums).toHaveLength(6)
    expect(normalNums).toEqual([1,13,22,35,41,46])
    expect(targetNums).not.toContain(49)
  })

  it('scope=all → 全部7个', () => {
    const { targetNums } = engine.selectTargetNums(NUMS, 'all')
    expect(targetNums).toHaveLength(7)
  })

  it('scope=special → 仅特码', () => {
    const { targetNums } = engine.selectTargetNums(NUMS, 'special')
    expect(targetNums).toEqual([49])
  })

  it('scope=normal → 仅平码', () => {
    const { targetNums } = engine.selectTargetNums(NUMS, 'normal')
    expect(targetNums).toHaveLength(6)
  })
})

describe('PlayEngine - isMultiPeriod() / isExcludeMode()', () => {
  let engine: PlayEngine

  beforeEach(() => { engine = new PlayEngine() })

  it('group_size=1 → 非多期', () => {
    const dsl: PlayDsl = { rule_code:'20001', rule_name:'平特一肖', predict_type:'attr_1', target_scope:'pt', hit_mode:'include', select_count:1, group_size:1 }
    expect(engine.isMultiPeriod(dsl)).toBe(false)
  })

  it('group_size=3 → 多期', () => {
    const dsl: PlayDsl = { rule_code:'30001', rule_name:'三期三肖', predict_type:'attr_1', target_scope:'pt', hit_mode:'include', select_count:3, group_size:3 }
    expect(engine.isMultiPeriod(dsl)).toBe(true)
  })

  it('hit_mode=exclude → 绝杀模式', () => {
    const dsl: PlayDsl = { rule_code:'20010', rule_name:'绝杀一肖', predict_type:'attr_1', target_scope:'t', hit_mode:'exclude', select_count:1, group_size:1 }
    expect(engine.isExcludeMode(dsl)).toBe(true)
  })

  it('hit_mode=include → 非绝杀', () => {
    const dsl: PlayDsl = { rule_code:'20001', rule_name:'平特一肖', predict_type:'attr_1', target_scope:'pt', hit_mode:'include', select_count:1, group_size:1 }
    expect(engine.isExcludeMode(dsl)).toBe(false)
  })
})

describe('PlayEngine - validatePredictionCount()', () => {
  let engine: PlayEngine

  beforeEach(() => { engine = new PlayEngine() })

  it('数量匹配 → true', () => {
    const dsl: PlayDsl = { rule_code:'20014', rule_name:'七肖中特', predict_type:'attr_1', target_scope:'t', hit_mode:'include', select_count:7, group_size:1 }
    expect(engine.validatePredictionCount(['马','牛','虎','兔','龙','蛇','羊'], dsl)).toBe(true)
  })

  it('数量不匹配 → false', () => {
    const dsl: PlayDsl = { rule_code:'20014', rule_name:'七肖中特', predict_type:'attr_1', target_scope:'t', hit_mode:'include', select_count:7, group_size:1 }
    expect(engine.validatePredictionCount(['马','牛','虎'], dsl)).toBe(false)
  })
})
