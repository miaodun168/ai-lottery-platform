import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SiteBuilderService } from '../../engines/site-builder/site-builder.service'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { SettlementService } from '../settlement/settlement.service'
import { GenerateYearDto } from './dto/generate-year.dto'
import { GeneratePlayDto } from './dto/generate-play.dto'
import { GenerateSiteDto } from './dto/generate-site.dto'
import { RebuildDto } from './dto/rebuild.dto'

@Injectable()
export class GeneratorService {
  constructor(
    private prisma:            PrismaService,
    private siteBuilder:       SiteBuilderService,
    private statisticsEngine:  StatisticsEngine,
    private settlementService: SettlementService,
  ) {}

  // ─── 站点初始化：创建默认页面结构 ────────────────────────────────────────────

  async generateSite(dto: GenerateSiteDto) {
    const siteId = BigInt(dto.site_id)
    const site = await this.prisma.site.findUnique({ where: { id: siteId } })
    if (!site) throw new NotFoundException(`站点 ${dto.site_id} 不存在`)

    await this.siteBuilder.initDefaultPages(siteId)

    const pages = await this.prisma.page.findMany({ where: { site_id: siteId } })

    return {
      site_id:    dto.site_id,
      site_name:  site.name,
      pages_created: pages.length,
      message:    `站点 "${site.name}" 默认页面初始化完成`,
    }
  }

  // ─── 玩法统计重算：重新计算单个玩法的全部统计 ──────────────────────────────

  async generatePlay(dto: GeneratePlayDto) {
    const playId = BigInt(dto.play_id)
    const play   = await this.prisma.play.findUnique({ where: { id: playId } })
    if (!play) throw new NotFoundException(`玩法 ${dto.play_id} 不存在`)

    const lotteryType = play.lottery_type ?? 'hk'

    await this.settlementService.refreshStatistics(playId, lotteryType, play.site_id)

    const summary = await this.prisma.statisticsSummary.findFirst({
      where: { play_id: playId, lottery_type: lotteryType },
    })

    return {
      site_id:     dto.site_id,
      play_id:     dto.play_id,
      play_name:   play.name,
      lottery_type: lotteryType,
      total_count: summary?.total_count ?? 0,
      hit_rate:    summary ? Number(summary.hit_rate) : 0,
      message:     `玩法 "${play.name}" 统计重算完成`,
    }
  }

  // ─── 年度数据重建：重算站点下指定年度所有玩法的统计 ────────────────────────

  async generateYear(dto: GenerateYearDto) {
    const { site_id, lottery_type, year } = dto
    const siteIdBig = BigInt(site_id)

    const plays = await this.prisma.play.findMany({
      where: { site_id: siteIdBig, lottery_type, status: 'active' },
    })
    if (plays.length === 0) {
      return { site_id, lottery_type, year, plays_processed: 0, message: '该站点无活跃玩法' }
    }

    let processed = 0
    for (const play of plays) {
      try {
        await this.settlementService.refreshStatistics(play.id, lottery_type, siteIdBig)
        processed++
      } catch (e) {
        console.error(`[GenerateYear] play=${play.id}`, e)
      }
    }

    // 汇总年度统计
    const summaries = await this.prisma.statisticsSummary.findMany({
      where: { site_id: siteIdBig, lottery_type },
    })
    const totalHit   = summaries.reduce((s, x) => s + (x.hit_count   ?? 0), 0)
    const totalCount = summaries.reduce((s, x) => s + (x.total_count ?? 0), 0)

    return {
      site_id,
      lottery_type,
      year,
      plays_processed: processed,
      total_plays:     plays.length,
      total_count:     totalCount,
      total_hit:       totalHit,
      year_rate:       totalCount > 0 ? Math.round(totalHit / totalCount * 10000) / 100 : 0,
      message:         `${year} 年度数据重建完成，处理 ${processed} 个玩法`,
    }
  }

  // ─── 全量重建：结算 + 统计全量重算 ──────────────────────────────────────────

  async rebuild(dto: RebuildDto) {
    const { site_id, lottery_type, year } = dto
    const siteIdBig = BigInt(site_id)

    const plays = await this.prisma.play.findMany({
      where: { site_id: siteIdBig, lottery_type },
    })
    if (plays.length === 0) {
      return { site_id, lottery_type, plays_total: 0, stats_processed: 0, settlement: null, year: year ?? null, message: '该站点无玩法' }
    }

    // Step 1: 如果提供了年份，先执行年度结算
    let settlementResult: any = null
    if (year) {
      try {
        settlementResult = await this.settlementService.settleYear({
          site_id,
          lottery_type,
          year,
        })
      } catch (e) {
        console.error('[Rebuild] settleYear error', e)
      }
    }

    // Step 2: 重算所有玩法的统计
    let statsProcessed = 0
    for (const play of plays) {
      try {
        await this.settlementService.refreshStatistics(play.id, lottery_type, siteIdBig)
        statsProcessed++
      } catch (e) {
        console.error(`[Rebuild] refreshStatistics play=${play.id}`, e)
      }
    }

    return {
      site_id,
      lottery_type,
      year:              year ?? null,
      plays_total:       plays.length,
      stats_processed:   statsProcessed,
      settlement:        settlementResult,
      message:           `全量重建完成：${statsProcessed}/${plays.length} 个玩法统计已更新`,
    }
  }
}
