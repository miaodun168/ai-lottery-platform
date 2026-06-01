import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { StatisticsQueryDto } from './dto/statistics-query.dto'

@Injectable()
export class StatisticsService {
  constructor(
    private prisma:            PrismaService,
    private statisticsEngine:  StatisticsEngine,
  ) {}

  async getStatistics(query: StatisticsQueryDto) {
    const where: any = {}
    if (query.site_id)      where.site_id      = BigInt(query.site_id)
    if (query.play_id)      where.play_id      = BigInt(query.play_id)
    if (query.lottery_type) where.lottery_type  = query.lottery_type

    const summary = await this.prisma.statisticsSummary.findFirst({ where })
    if (!summary) return null

    const periods = await this.prisma.statisticsPeriod.findMany({ where })
    const periodMap = Object.fromEntries(periods.map(p => [p.period_type, p]))

    return {
      play_id:             summary.play_id?.toString(),
      total_rate:          Number(summary.hit_rate),
      last_10_rate:        Number(periodMap['last_10']?.hit_rate  ?? 0),
      last_30_rate:        Number(periodMap['last_30']?.hit_rate  ?? 0),
      last_100_rate:       Number(periodMap['last_100']?.hit_rate ?? 0),
      total_count:         summary.total_count,
      hit_count:           summary.hit_count,
      miss_count:          summary.miss_count,
      current_hit_streak:  summary.current_hit_streak,
      current_miss_streak: summary.current_miss_streak,
      best_hit_streak:     summary.best_hit_streak,
      best_miss_streak:    summary.best_miss_streak,
      hidden_count:        summary.hidden_count,
      updated_at:          summary.updated_at,
    }
  }

  async getRanking(lotteryType?: string) {
    const where: any = lotteryType ? { lottery_type: lotteryType } : {}
    const summaries = await this.prisma.statisticsSummary.findMany({
      where,
      orderBy: { hit_rate: 'desc' },
      take: 50,
    })

    return summaries.map((s, i) => ({
      rank:         i + 1,
      play_id:      s.play_id?.toString(),
      lottery_type: s.lottery_type,
      hit_rate:     Number(s.hit_rate),
      total_count:  s.total_count,
      hit_count:    s.hit_count,
    }))
  }

  async getHot() {
    // 按总期数排序（最活跃的玩法）
    const summaries = await this.prisma.statisticsSummary.findMany({
      orderBy: { total_count: 'desc' },
      take: 20,
    })
    return summaries.map(s => ({
      play_id:     s.play_id?.toString(),
      total_count: s.total_count,
      hit_rate:    Number(s.hit_rate),
    }))
  }

  async getTrend(query: StatisticsQueryDto) {
    const where: any = { status: { in: ['HIT', 'MISS'] } }
    if (query.site_id)      where.site_id      = BigInt(query.site_id)
    if (query.play_id)      where.play_id      = BigInt(query.play_id)
    if (query.lottery_type) where.lottery_type  = query.lottery_type

    const records = await this.prisma.settlementRecord.findMany({
      where,
      orderBy: { period: 'asc' },
      take: 100,
    })

    return records.map(r => ({
      period: r.period,
      hit:    r.hit,
      status: r.status,
    }))
  }

  async getYearSummary(year: number, lotteryType?: string) {
    const where: any = { year }
    if (lotteryType) where.lottery_type = lotteryType

    const summaries = await this.prisma.statisticsSummary.findMany({ where })

    const totalHit   = summaries.reduce((s, x) => s + (x.hit_count   ?? 0), 0)
    const totalCount = summaries.reduce((s, x) => s + (x.total_count ?? 0), 0)
    const rate = totalCount > 0 ? Math.round(totalHit / totalCount * 10000) / 100 : 0

    return { year, total_count: totalCount, hit_count: totalHit, miss_count: totalCount - totalHit, rate }
  }

  // ─── 全量重算：遍历所有有结算记录的玩法，重新写入统计表 ──────────────────────

  async rebuildAll(lotteryType?: string) {
    // 取所有需要重算的 (play_id, lottery_type) 组合
    const groups = await this.prisma.settlementRecord.groupBy({
      by:    ['play_id', 'lottery_type'],
      where: lotteryType ? { lottery_type: lotteryType } : undefined,
    })

    if (groups.length === 0) {
      return { processed: 0, message: '无结算记录，跳过重算' }
    }

    let processed = 0
    const now = new Date()
    const year = now.getFullYear()

    for (const group of groups) {
      if (!group.play_id) continue

      try {
        const allSr = await this.prisma.settlementRecord.findMany({
          where:   { play_id: group.play_id, lottery_type: group.lottery_type },
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

        const summary = this.statisticsEngine.calculate(records)

        // 查站点（取第一条记录的 site_id）
        const siteId = allSr[0]?.site_id ?? null

        // Upsert StatisticsSummary
        const existing = await this.prisma.statisticsSummary.findFirst({
          where: { play_id: group.play_id, lottery_type: group.lottery_type },
        })
        const data = {
          site_id:             siteId,
          lottery_type:        group.lottery_type,
          play_id:             group.play_id,
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
          updated_at:          now,
        }
        if (existing) {
          await this.prisma.statisticsSummary.update({ where: { id: existing.id }, data })
        } else {
          await this.prisma.statisticsSummary.create({ data })
        }

        // Upsert StatisticsPeriod (last_10 / last_30 / last_100)
        for (const [pType, stats] of Object.entries({
          last_10:  summary.last_10,
          last_30:  summary.last_30,
          last_100: summary.last_100,
        })) {
          const existingP = await this.prisma.statisticsPeriod.findFirst({
            where: { play_id: group.play_id, lottery_type: group.lottery_type, period_type: pType },
          })
          const pData = {
            site_id:     siteId,
            lottery_type: group.lottery_type,
            play_id:     group.play_id,
            period_type: pType,
            hit_count:   stats.hit_count,
            miss_count:  stats.miss_count,
            hit_rate:    stats.hit_rate,
            updated_at:  now,
          }
          if (existingP) {
            await this.prisma.statisticsPeriod.update({ where: { id: existingP.id }, data: pData })
          } else {
            await this.prisma.statisticsPeriod.create({ data: pData })
          }
        }

        processed++
      } catch (e) {
        console.error(`[StatisticsService.rebuildAll] play_id=${group.play_id}`, e)
      }
    }

    return {
      processed,
      total_groups: groups.length,
      lottery_type: lotteryType ?? 'all',
      message: `统计全量重算完成，处理 ${processed}/${groups.length} 个玩法`,
    }
  }
}
