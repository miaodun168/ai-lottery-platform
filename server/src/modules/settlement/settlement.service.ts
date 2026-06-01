import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SettlementEngine } from '../../engines/settlement/settlement.engine'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { AttributeEngine } from '../../engines/attribute/attribute.engine'
import { PlayEngine } from '../../engines/play/play.engine'
import { LotteryResult } from '../../engines/result/result.engine'
import { SettlePeriodDto } from './dto/settle-period.dto'
import { SettleBatchDto } from './dto/settle-batch.dto'
import { SettleYearDto } from './dto/settle-year.dto'

@Injectable()
export class SettlementService {
  constructor(
    private prisma:           PrismaService,
    private settlementEngine: SettlementEngine,
    private statisticsEngine: StatisticsEngine,
    private attributeEngine:  AttributeEngine,
    private playEngine:       PlayEngine,
  ) {}

  // ─── 单期结算：对一个期号执行所有玩法的结算 ─────────────────────────────────

  async settlePeriod(dto: SettlePeriodDto) {
    const { lottery_type, period } = dto

    const lotteryResult = await this.loadLotteryResult(lottery_type, period)
    if (!lotteryResult) throw new NotFoundException(`期号 ${period} 的开奖结果不存在`)

    const plays = await this.prisma.play.findMany({
      where: { lottery_type, status: 'active' },
    })

    let settled = 0
    const affectedSiteIds = new Set<bigint | null>()

    for (const play of plays) {
      try {
        const prediction = await this.prisma.predictionRecord.findFirst({
          where: { play_id: play.id, period, status: 'active' },
        })
        if (!prediction) continue

        const rule = await this.prisma.playRule.findFirst({ where: { rule_code: play.rule_code ?? '' } })
        if (!rule?.dsl) continue

        const dsl         = this.playEngine.parseDsl(rule.dsl)
        const predictions = (prediction.prediction_content ?? '').split(',').map(s => s.trim()).filter(Boolean)
        if (predictions.length === 0) continue

        const sr = this.settlementEngine.settle(period, predictions, lotteryResult, dsl, 0, 0)

        await this.prisma.settlementRecord.deleteMany({ where: { play_id: play.id, period } })
        await this.prisma.settlementRecord.create({
          data: {
            site_id:       play.site_id,
            lottery_type,
            play_id:       play.id,
            period,
            prediction_id: prediction.id,
            hit:           sr.hit,
            status:        sr.status,
            created_at:    new Date(),
          },
        })

        await this.refreshStatistics(play.id, lottery_type, play.site_id)
        affectedSiteIds.add(play.site_id)
        settled++
      } catch (e) {
        console.error(`[SettlementService] play=${play.id} period=${period}`, e)
      }
    }

    return {
      period,
      lottery_type,
      settled,
      plays_checked: plays.length,
    }
  }

  // ─── 批量结算：结算某年所有期号 ─────────────────────────────────────────────

  async settleBatch(dto: SettleBatchDto) {
    const { lottery_type, year } = dto

    const results = await this.prisma.result.findMany({
      where:   { lottery_type, period: { startsWith: String(year) } },
      orderBy: { period: 'asc' },
    })

    if (results.length === 0) {
      return { lottery_type, year, periods_processed: 0, total_settled: 0, message: '该年无开奖记录' }
    }

    let totalSettled = 0
    let periodsProcessed = 0

    for (const r of results) {
      try {
        const res = await this.settlePeriod({ lottery_type, period: r.period })
        totalSettled      += res.settled
        periodsProcessed  += 1
      } catch (e) {
        // 单期失败不中断批量
        console.error(`[SettleBatch] period=${r.period}`, e)
      }
    }

    return {
      lottery_type,
      year,
      periods_processed: periodsProcessed,
      total_settled:     totalSettled,
    }
  }

  // ─── 年度结算：针对特定站点结算全年所有玩法 ──────────────────────────────────

  async settleYear(dto: SettleYearDto) {
    const { site_id, lottery_type, year } = dto
    const siteIdBig = BigInt(site_id)

    const plays = await this.prisma.play.findMany({
      where: { site_id: siteIdBig, lottery_type, status: 'active' },
    })

    const results = await this.prisma.result.findMany({
      where:   { lottery_type, period: { startsWith: String(year) } },
      orderBy: { period: 'asc' },
    })

    if (results.length === 0) {
      return { site_id, lottery_type, year, plays: plays.length, total_settled: 0, message: '该年无开奖记录' }
    }

    // 预先构建全年 LotteryResult Map（避免重复查 DB）
    const resultMap = new Map<string, LotteryResult>()
    for (const r of results) {
      const lr = await this.loadLotteryResult(lottery_type, r.period)
      if (lr) resultMap.set(r.period, lr)
    }

    let totalSettled = 0

    for (const play of plays) {
      if (!play.rule_code) continue

      const rule = await this.prisma.playRule.findFirst({ where: { rule_code: play.rule_code } })
      if (!rule?.dsl) continue

      const dsl = this.playEngine.parseDsl(rule.dsl)

      const predictions = await this.prisma.predictionRecord.findMany({
        where: {
          site_id:      siteIdBig,
          play_id:      play.id,
          lottery_type,
          year,
          status:       'active',
        },
        orderBy: { period: 'asc' },
      })
      if (predictions.length === 0) continue

      const predRecords = predictions.map(p => ({
        period:             p.period,
        prediction_content: p.prediction_content ?? '',
      }))

      const settled = this.settlementEngine.settleBatch(predRecords, resultMap, dsl)

      for (const sr of settled) {
        const pred = predictions.find(p => p.period === sr.period)
        await this.prisma.settlementRecord.deleteMany({ where: { play_id: play.id, period: sr.period } })
        await this.prisma.settlementRecord.create({
          data: {
            site_id:       siteIdBig,
            lottery_type,
            play_id:       play.id,
            period:        sr.period,
            prediction_id: pred?.id ?? null,
            hit:           sr.hit,
            status:        sr.status,
            created_at:    new Date(),
          },
        })
        totalSettled++
      }

      await this.refreshStatistics(play.id, lottery_type, siteIdBig)
    }

    return {
      site_id,
      lottery_type,
      year,
      plays_processed: plays.length,
      total_settled:   totalSettled,
    }
  }

  // ─── 共享：重算单个玩法的统计汇总（供外部调用）─────────────────────────────

  async refreshStatistics(playId: bigint, lotteryType: string, siteId: bigint | null) {
    const year = new Date().getFullYear()

    const allSr = await this.prisma.settlementRecord.findMany({
      where:   { play_id: playId, lottery_type: lotteryType },
      orderBy: { period: 'asc' },
    })

    const records = allSr.map(s => ({
      period:      s.period,
      prediction:  [] as string[],
      hit:         s.hit ?? false,
      status:      (s.status ?? 'MISS') as any,
      miss_streak: 0,
      hit_streak:  0,
    }))

    if (records.length === 0) return

    const summary = this.statisticsEngine.calculate(records)

    const existing = await this.prisma.statisticsSummary.findFirst({
      where: { play_id: playId, lottery_type: lotteryType },
    })

    const data = {
      site_id:             siteId,
      lottery_type:        lotteryType,
      play_id:             playId,
      year,
      total_count:         summary.total_count,
      hit_count:           summary.hit_count,
      miss_count:          summary.miss_count,
      hit_rate:            summary.hit_rate,
      current_hit_streak:  summary.current_hit_streak,
      current_miss_streak: summary.current_miss_streak,
      best_hit_streak:     summary.best_hit_streak,
      best_miss_streak:    summary.best_miss_streak,
      hidden_count:        summary.hidden_count,
      updating_count:      summary.updating_count,
      updated_at:          new Date(),
    }

    if (existing) {
      await this.prisma.statisticsSummary.update({ where: { id: existing.id }, data })
    } else {
      await this.prisma.statisticsSummary.create({ data })
    }

    for (const [pType, stats] of Object.entries({
      last_10:  summary.last_10,
      last_30:  summary.last_30,
      last_100: summary.last_100,
    })) {
      const existingP = await this.prisma.statisticsPeriod.findFirst({
        where: { play_id: playId, lottery_type: lotteryType, period_type: pType },
      })
      const pData = {
        site_id:     siteId,
        lottery_type: lotteryType,
        play_id:     playId,
        period_type: pType,
        hit_count:   stats.hit_count,
        miss_count:  stats.miss_count,
        hit_rate:    stats.hit_rate,
        updated_at:  new Date(),
      }
      if (existingP) {
        await this.prisma.statisticsPeriod.update({ where: { id: existingP.id }, data: pData })
      } else {
        await this.prisma.statisticsPeriod.create({ data: pData })
      }
    }
  }

  // ─── 私有：从 DB 重建 LotteryResult ─────────────────────────────────────────

  private async loadLotteryResult(lotteryType: string, period: string): Promise<LotteryResult | null> {
    const result = await this.prisma.result.findFirst({ where: { lottery_type: lotteryType, period } })
    if (!result) return null

    const numRows = await this.prisma.resultNumber.findMany({
      where:   { result_id: result.id },
      orderBy: { seq_no: 'asc' },
    })
    if (numRows.length === 0) return null

    const year = parseInt(period.substring(0, 4))
    const entries = await this.prisma.attributeLibrary.findMany({
      where: { year, attribute_type: { in: ['zodiac_number', 'element'] } },
    })
    const { zodiacMap, elementMap } = this.attributeEngine.buildYearMaps(
      entries.map(e => ({
        attribute_type:  e.attribute_type  ?? '',
        attribute_name:  e.attribute_name  ?? '',
        attribute_value: e.attribute_value ?? '[]',
        year,
      })),
    )

    const numbers    = numRows.map(n => n.number_value)
    const attributes = this.attributeEngine.computeAll(numbers, zodiacMap, elementMap)

    return {
      period,
      numbers,
      normalNums:  numbers.slice(0, 6),
      specialNum:  numbers[6],
      attributes,
    }
  }
}
