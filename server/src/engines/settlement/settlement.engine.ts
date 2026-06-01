import { Injectable } from '@nestjs/common'
import { AttributeEngine } from '../attribute/attribute.engine'
import { NumberAttributes } from '../attribute/attribute.types'
import { PlayDsl, PlayEngine } from '../play/play.engine'
import { LotteryResult } from '../result/result.engine'

export type SettleStatus = 'WAITING' | 'HIT' | 'MISS' | 'UPDATING' | 'HIDDEN'

export interface SettlementResult {
  period:       string
  play_id?:     bigint
  prediction:   string | string[]
  hit:          boolean
  status:       SettleStatus
  miss_streak:  number
  hit_streak:   number
  detail?:      string
}

export interface MultiPeriodInput {
  period:     string
  prediction: string[]
  result:     LotteryResult
}

export interface MultiPeriodResult {
  group_id:   string
  group_hit:  boolean
  periods:    SettlementResult[]
}

@Injectable()
export class SettlementEngine {
  constructor(
    private readonly attrEngine: AttributeEngine,
    private readonly playEngine: PlayEngine,
  ) {}

  // ─── 单期结算 ─────────────────────────────────────────────────────────────

  settle(
    period: string,
    predictions: string[],
    result: LotteryResult,
    dsl: PlayDsl,
    currentMissStreak = 0,
    currentHitStreak = 0,
  ): SettlementResult {
    const { targetNums } = this.playEngine.selectTargetNums(result.numbers, dsl.target_scope)

    const targetAttrs = result.attributes.filter((_, i) => targetNums.includes(result.numbers[i]))

    const hit = this.evalHit(predictions, targetAttrs, dsl)

    const newMissStreak = hit ? 0 : currentMissStreak + 1
    const newHitStreak  = hit ? currentHitStreak + 1 : 0

    return {
      period,
      prediction:  predictions,
      hit,
      status:      hit ? 'HIT' : 'MISS',
      miss_streak: newMissStreak,
      hit_streak:  newHitStreak,
    }
  }

  // ─── 多期玩法结算（组内任意一期命中=整组命中）────────────────────────────

  settleMultiPeriod(inputs: MultiPeriodInput[], dsl: PlayDsl): MultiPeriodResult {
    const periods: SettlementResult[] = inputs.map(inp =>
      this.settle(inp.period, inp.prediction, inp.result, dsl)
    )
    const group_hit = periods.some(p => p.hit)

    return {
      group_id:  inputs.map(i => i.period).join('-'),
      group_hit,
      periods,
    }
  }

  // ─── 批量结算（一次性处理全年数据，返回每期结算结果）────────────────────

  settleBatch(
    records: Array<{ period: string; prediction_content: string }>,
    results: Map<string, LotteryResult>,
    dsl: PlayDsl,
    hideLimit = 3,
  ): SettlementResult[] {
    const settled: SettlementResult[] = []
    let missStreak = 0
    let hitStreak  = 0

    const sortedRecords = [...records].sort((a, b) => a.period.localeCompare(b.period))

    for (const rec of sortedRecords) {
      const result = results.get(rec.period)
      if (!result) continue

      const predictions = rec.prediction_content.split(',').map(s => s.trim())
      const sr = this.settle(rec.period, predictions, result, dsl, missStreak, hitStreak)

      missStreak = sr.miss_streak
      hitStreak  = sr.hit_streak

      settled.push(sr)
    }

    return this.applyHideRule(settled, hideLimit)
  }

  // ─── 隐藏规则：连错 >= hideLimit 之前全部隐藏 ─────────────────────────────

  applyHideRule(results: SettlementResult[], hideLimit: number): SettlementResult[] {
    const processed = [...results]
    let missRun = 0
    let hideFromIdx = -1

    for (let i = 0; i < processed.length; i++) {
      const sr = processed[i]
      if (sr.status === 'HIT') {
        missRun = 0
        hideFromIdx = -1
      } else if (sr.status === 'MISS') {
        missRun++
        if (missRun >= hideLimit && hideFromIdx === -1) {
          // 找到连错开始的位置
          hideFromIdx = i - (hideLimit - 1)
          // 隐藏 hideFromIdx 之前的所有记录（本次连错之前的整个历史段）
          for (let j = 0; j < hideFromIdx; j++) {
            if (processed[j].status !== 'HIDDEN') {
              processed[j] = { ...processed[j], status: 'HIDDEN' }
            }
          }
        }
      }
    }

    return processed
  }

  // ─── 生成"更新中"占位（连错后）──────────────────────────────────────────

  generateUpdatingSlots(lastPeriod: string, count: number): SettlementResult[] {
    const lastNum = parseInt(lastPeriod.slice(-3))
    const yearPrefix = lastPeriod.slice(0, 4)
    const slots: SettlementResult[] = []

    for (let i = 1; i <= count; i++) {
      const newNum = String(lastNum + i).padStart(3, '0')
      slots.push({
        period:      `${yearPrefix}${newNum}`,
        prediction:  [],
        hit:         false,
        status:      'UPDATING',
        miss_streak: 0,
        hit_streak:  0,
        detail:      '正在更新',
      })
    }
    return slots
  }

  // ─── 内部：命中判定 ───────────────────────────────────────────────────────

  private evalHit(predictions: string[], targetAttrs: NumberAttributes[], dsl: PlayDsl): boolean {
    const { predict_type, hit_mode } = dsl

    if (targetAttrs.length === 0) return false

    // 对每个目标号码提取对应属性值
    const attrValues = targetAttrs.map(a => this.attrEngine.getAttrByPredictType(a, predict_type))

    if (hit_mode === 'include') {
      // 包含命中：预测值中有任意一个出现在结果属性中
      return predictions.some(pred =>
        attrValues.some(val => this.attrEngine.matchAttr(pred, val))
      )
    } else {
      // 排除命中（绝杀）：预测值全部不在结果属性中才算中
      return predictions.every(pred =>
        !attrValues.some(val => this.attrEngine.matchAttr(pred, val))
      )
    }
  }
}
