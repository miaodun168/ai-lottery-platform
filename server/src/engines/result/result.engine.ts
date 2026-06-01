import { Injectable } from '@nestjs/common'
import { AttributeEngine } from '../attribute/attribute.engine'
import { NumberAttributes, ZodiacYearMap, ElementYearMap } from '../attribute/attribute.types'

export interface LotteryResult {
  period:      string
  numbers:     number[]     // 7个，前6=平码，最后1=特码
  normalNums:  number[]     // 前6平码
  specialNum:  number       // 特码
  attributes:  NumberAttributes[]  // 每个号码的完整属性快照
}

export interface ValidationResult {
  valid:   boolean
  errors:  string[]
}

@Injectable()
export class ResultEngine {
  constructor(private readonly attrEngine: AttributeEngine) {}

  // ─── 验证开奖号码 ─────────────────────────────────────────────────────────

  validate(numbers: number[]): ValidationResult {
    const errors: string[] = []

    if (numbers.length !== 7) {
      errors.push(`号码数量必须为7个，当前为 ${numbers.length} 个`)
    }

    for (const n of numbers) {
      if (!Number.isInteger(n) || n < 1 || n > 49) {
        errors.push(`号码 ${n} 超出范围（1-49）`)
      }
    }

    const seen = new Set<number>()
    for (const n of numbers) {
      if (seen.has(n)) errors.push(`号码 ${n} 重复`)
      seen.add(n)
    }

    return { valid: errors.length === 0, errors }
  }

  // ─── 处理开奖结果：验证 + 生成属性快照 ────────────────────────────────────

  process(
    period: string,
    numbers: number[],
    zodiacMap?: ZodiacYearMap,
    elementMap?: ElementYearMap,
  ): LotteryResult {
    const v = this.validate(numbers)
    if (!v.valid) throw new Error(`开奖数据验证失败: ${v.errors.join('; ')}`)

    const attributes = this.attrEngine.computeAll(numbers, zodiacMap, elementMap)

    return {
      period,
      numbers,
      normalNums: numbers.slice(0, 6),
      specialNum: numbers[6],
      attributes,
    }
  }

  // ─── 获取特码属性 ─────────────────────────────────────────────────────────

  getSpecialAttributes(result: LotteryResult): NumberAttributes {
    return result.attributes[6]
  }

  // ─── 获取平码属性 ─────────────────────────────────────────────────────────

  getNormalAttributes(result: LotteryResult): NumberAttributes[] {
    return result.attributes.slice(0, 6)
  }
}
