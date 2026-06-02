import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SiteBuilderService } from '../../engines/site-builder/site-builder.service'
import { ThemeEngine } from '../../engines/theme/theme.engine'
import { LayoutEngine } from '../../engines/layout/layout.engine'

@Injectable()
export class PublicService {
  constructor(
    private prisma:          PrismaService,
    private siteBuilder:     SiteBuilderService,
    private themeEngine:     ThemeEngine,
    private layoutEngine:    LayoutEngine,
  ) {}

  async getHome(siteCode: string, lotteryType: string) {
    const data = await this.siteBuilder.buildHomePage(siteCode, lotteryType)
    if (!data) throw new NotFoundException(`站点 ${siteCode} 不存在`)
    return data
  }

  async getResults(siteCode: string, lotteryType: string, page: number, limit: number) {
    return this.siteBuilder.buildResultsPage(siteCode, lotteryType, page, limit)
  }

  async getPlayDetail(siteCode: string, playId: string, lotteryType: string) {
    const data = await this.siteBuilder.buildPlayDetailPage(siteCode, BigInt(playId), lotteryType)
    if (!data) throw new NotFoundException(`玩法 ${playId} 不存在`)
    return data
  }

  async getStatistics(siteCode: string, lotteryType: string) {
    return this.siteBuilder.buildStatisticsPage(siteCode, lotteryType)
  }

  async getThemeList() {
    return this.themeEngine.listAll()
  }

  async getLayoutList() {
    return this.layoutEngine.listAll()
  }

  async getSiteTheme(siteCode: string) {
    const site = await this.prisma.site.findFirst({ where: { code: siteCode, status: 'published' } })
    if (!site) throw new NotFoundException('站点不存在')
    const theme = site.theme_id ? await this.themeEngine.loadFromDb(site.theme_id) : null
    const resolved = theme ?? this.themeEngine.resolve('theme_default')
    return { ...resolved, css_vars: this.themeEngine.toCssVars(resolved) }
  }

  async getPlaysLazy(siteCode: string, lotteryType: string, page: number, limit: number) {
    const site = await this.prisma.site.findFirst({ where: { code: siteCode, status: 'published' } })
    if (!site) throw new NotFoundException('站点不存在')

    const skip = (page - 1) * limit
    const [plays, total] = await Promise.all([
      this.prisma.play.findMany({ where: { site_id: site.id, lottery_type: lotteryType, status: 'active' }, orderBy: { sort_no: 'asc' }, skip, take: limit }),
      this.prisma.play.count({ where: { site_id: site.id, lottery_type: lotteryType, status: 'active' } }),
    ])

    const summaries = await this.prisma.statisticsSummary.findMany({
      where: { play_id: { in: plays.map(p => p.id) }, lottery_type: lotteryType },
    })
    const statsMap: Map<string, any> = new Map(summaries.map(s => [s.play_id?.toString(), s]))

    const latestResult = await this.prisma.result.findFirst({ where: { lottery_type: lotteryType }, orderBy: { period: 'desc' } })

    return {
      page, limit, total, pages: Math.ceil(total / limit),
      lazy_load: true,
      lottery_type: lotteryType,
      items: plays.map(p => {
        const s = statsMap.get(p.id.toString())
        return {
          play_id:    p.id.toString(),
          name:       p.name,
          alias_name: p.alias_name,
          rule_code:  p.rule_code,
          hit_rate:   s ? Number(s.hit_rate) : null,
          total_count: s?.total_count ?? 0,
          period:     latestResult?.period ?? null,
          current_miss_streak: s?.current_miss_streak ?? 0,
          hidden:     (s?.current_miss_streak ?? 0) >= 3,
        }
      }),
    }
  }
}
