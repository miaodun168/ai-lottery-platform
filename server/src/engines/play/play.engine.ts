import { Injectable } from '@nestjs/common'

// ─── DSL 结构（与 play_rule.dsl 字段对应）────────────────────────────────────

export interface PlayDsl {
  rule_code:    string
  rule_name:    string
  predict_type: string   // number | number_1 | number_2 | attr_1~attr_11
  target_scope: string   // pt=平+特  p=平码  t=特码
  hit_mode:     string   // include | exclude
  select_count: number   // 预测数量
  group_size:   number   // 期数（1=单期 3=三期 5=五期）
  version?:     string
}

export interface ParseResult {
  dsl:        PlayDsl
  normalNums: number[]   // scope 中的平码号码
  specialNum: number     // 特码
  targetNums: number[]   // 根据 target_scope 选出的号码
}

@Injectable()
export class PlayEngine {

  // ─── 解析 DSL JSON 字符串 ─────────────────────────────────────────────────

  parseDsl(dslJson: string): PlayDsl {
    return JSON.parse(dslJson) as PlayDsl
  }

  // ─── 根据 target_scope 从开奖号码中选取目标号码 ───────────────────────────

  selectTargetNums(numbers: number[], scope: string): { normalNums: number[]; specialNum: number; targetNums: number[] } {
    const normalNums = numbers.slice(0, 6)
    const specialNum = numbers[6]

    let targetNums: number[]
    switch (scope) {
      case 'pt':  targetNums = numbers; break         // 平码+特码（全部7个）
      case 'p':   targetNums = normalNums; break      // 仅平码
      case 't':   targetNums = [specialNum]; break    // 仅特码
      // 兼容文档中 all/normal/special 写法
      case 'all':     targetNums = numbers; break
      case 'normal':  targetNums = normalNums; break
      case 'special': targetNums = [specialNum]; break
      default:        targetNums = numbers
    }

    return { normalNums, specialNum, targetNums }
  }

  // ─── 是否为多期玩法 ────────────────────────────────────────────────────────

  isMultiPeriod(dsl: PlayDsl): boolean {
    return dsl.group_size > 1
  }

  // ─── 是否为绝杀（排除）玩法 ───────────────────────────────────────────────

  isExcludeMode(dsl: PlayDsl): boolean {
    return dsl.hit_mode === 'exclude'
  }

  // ─── 验证预测内容数量 ─────────────────────────────────────────────────────

  validatePredictionCount(predictions: string[], dsl: PlayDsl): boolean {
    return predictions.length === dsl.select_count
  }
}
