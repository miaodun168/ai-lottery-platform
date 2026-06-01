import { Injectable } from '@nestjs/common'
import { SettlementResult } from '../settlement/settlement.engine'

export interface PeriodStats {
  period_type:  string   // last_10 | last_30 | last_100
  total:        number
  hit_count:    number
  miss_count:   number
  hit_rate:     number
}

export interface StreakStats {
  current_hit_streak:  number
  current_miss_streak: number
  best_hit_streak:     number
  best_miss_streak:    number
}

export interface StatisticsSummary {
  total_count:         number
  hit_count:           number
  miss_count:          number
  hit_rate:            number
  hidden_count:        number
  updating_count:      number
  current_hit_streak:  number
  current_miss_streak: number
  best_hit_streak:     number
  best_miss_streak:    number
  last_10:             PeriodStats
  last_30:             PeriodStats
  last_100:            PeriodStats
}

@Injectable()
export class StatisticsEngine {

  // ─── 主入口：从结算记录计算完整统计 ──────────────────────────────────────

  calculate(records: SettlementResult[]): StatisticsSummary {
    // 只统计 HIT 和 MISS，过滤 HIDDEN / UPDATING / WAITING
    const countable = records.filter(r => r.status === 'HIT' || r.status === 'MISS')

    const total_count   = countable.length
    const hit_count     = countable.filter(r => r.hit).length
    const miss_count    = total_count - hit_count
    const hit_rate      = this.calcRate(hit_count, total_count)
    const hidden_count  = records.filter(r => r.status === 'HIDDEN').length
    const updating_count = records.filter(r => r.status === 'UPDATING').length

    const streaks = this.calcStreaks(countable)

    return {
      total_count,
      hit_count,
      miss_count,
      hit_rate,
      hidden_count,
      updating_count,
      ...streaks,
      last_10:  this.calcPeriodStats(countable, 10,  'last_10'),
      last_30:  this.calcPeriodStats(countable, 30,  'last_30'),
      last_100: this.calcPeriodStats(countable, 100, 'last_100'),
    }
  }

  // ─── 命中率公式：命中数 ÷ 已开奖总数 × 100，保留两位小数 ─────────────────

  calcRate(hitCount: number, totalCount: number): number {
    if (totalCount === 0) return 0
    return Math.round((hitCount / totalCount) * 10000) / 100
  }

  // ─── 近 N 期统计 ──────────────────────────────────────────────────────────

  calcPeriodStats(records: SettlementResult[], n: number, periodType: string): PeriodStats {
    const slice     = records.slice(-n)
    const total     = slice.length
    const hit_count = slice.filter(r => r.hit).length
    const miss_count = total - hit_count
    const hit_rate  = this.calcRate(hit_count, total)

    return { period_type: periodType, total, hit_count, miss_count, hit_rate }
  }

  // ─── 连中/连错统计 ────────────────────────────────────────────────────────

  calcStreaks(records: SettlementResult[]): StreakStats {
    let curHit = 0, curMiss = 0, bestHit = 0, bestMiss = 0

    for (const r of records) {
      if (r.hit) {
        curHit++
        curMiss = 0
        if (curHit > bestHit) bestHit = curHit
      } else {
        curMiss++
        curHit = 0
        if (curMiss > bestMiss) bestMiss = curMiss
      }
    }

    return {
      current_hit_streak:  curHit,
      current_miss_streak: curMiss,
      best_hit_streak:     bestHit,
      best_miss_streak:    bestMiss,
    }
  }

  // ─── 多期玩法统计（按组统计，而非单期）────────────────────────────────────

  calcGroupStats(groupResults: boolean[]): { group_total: number; group_hit: number; group_miss: number; group_rate: number } {
    const group_total = groupResults.length
    const group_hit   = groupResults.filter(Boolean).length
    const group_miss  = group_total - group_hit
    const group_rate  = this.calcRate(group_hit, group_total)
    return { group_total, group_hit, group_miss, group_rate }
  }

  // ─── 排行榜：按命中率降序排列 ────────────────────────────────────────────

  buildRanking(entries: Array<{ play_id: bigint; play_name: string; summary: StatisticsSummary }>): Array<{
    rank: number; play_id: bigint; play_name: string; hit_rate: number; last_10_rate: number
  }> {
    return entries
      .sort((a, b) => b.summary.hit_rate - a.summary.hit_rate)
      .map((e, i) => ({
        rank:        i + 1,
        play_id:     e.play_id,
        play_name:   e.play_name,
        hit_rate:    e.summary.hit_rate,
        last_10_rate: e.summary.last_10.hit_rate,
      }))
  }

  // ─── 格式化统计输出（API 返回格式）──────────────────────────────────────

  format(summary: StatisticsSummary): Record<string, any> {
    return {
      total_rate:            summary.hit_rate,
      last_10_rate:          summary.last_10.hit_rate,
      last_30_rate:          summary.last_30.hit_rate,
      last_100_rate:         summary.last_100.hit_rate,
      current_hit_streak:    summary.current_hit_streak,
      current_miss_streak:   summary.current_miss_streak,
      best_hit_streak:       summary.best_hit_streak,
      best_miss_streak:      summary.best_miss_streak,
      hidden_count:          summary.hidden_count,
      updating_count:        summary.updating_count,
      total_count:           summary.total_count,
      hit_count:             summary.hit_count,
      miss_count:            summary.miss_count,
    }
  }
}
