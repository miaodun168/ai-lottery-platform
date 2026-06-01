import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ThemeEngine } from '../theme/theme.engine'
import { LayoutEngine } from '../layout/layout.engine'

export interface SeoConfig {
  title:       string
  keywords:    string
  description: string
  og_title?:   string
  og_image?:   string
}

export interface HomepageData {
  site:         any
  theme:        any
  layout:       any
  seo:          SeoConfig
  lazy_load:    { enabled: boolean; initial_count: number; batch_size: number }
  lottery_type: string
  components: {
    logo:           { title: string; subtitle: string; logo_url: string | null }
    result_board:   { current_result: any; lottery_type: string; status: string }
    banner_slider:  { slides: any[] }
    lottery_switch: { current: string; options: string[] }
    bottom_nav:     { items: Array<{ label: string; icon: string; path: string }> }
  }
  content_slots: any[]   // 动态内容区（玩法+广告+栏目，按 layout 顺序）
}

export interface ResultsPageData {
  site:         any
  theme:        any
  seo:          SeoConfig
  lottery_type: string
  results:      any[]
  pagination:   { page: number; limit: number; total: number; pages: number }
}

export interface PlayDetailPageData {
  site:        any
  theme:       any
  seo:         SeoConfig
  play:        any
  rule:        any
  statistics:  any
  history:     any[]   // 近100期结算记录
}

export interface StatisticsPageData {
  site:         any
  theme:        any
  seo:          SeoConfig
  lottery_type: string
  ranking:      any[]
  year_summary: any
  hot_plays:    any[]
}

@Injectable()
export class SiteBuilderService {
  constructor(
    private prisma:       PrismaService,
    private themeEngine:  ThemeEngine,
    private layoutEngine: LayoutEngine,
  ) {}

  // ─── 构建首页 ──────────────────────────────────────────────────────────

  async buildHomePage(siteCode: string, lotteryType = 'hk'): Promise<HomepageData> {
    const site = await this.prisma.site.findFirst({ where: { code: siteCode } })
    if (!site) return null

    // 加载主题（DB → fallback 常量库）
    const theme = site.theme_id ? await this.themeEngine.loadFromDb(site.theme_id) : null
    const resolvedTheme = theme ?? this.themeEngine.resolve('theme_default')

    // 加载数据
    const plays = await this.prisma.play.findMany({ where: { site_id: site.id, lottery_type: lotteryType, status: 'active' }, orderBy: { sort_no: 'asc' }, take: 50 })
    const ads   = await this.prisma.ad.findMany({ where: { site_id: site.id, status: true }, orderBy: { sort_no: 'asc' }, take: 10 })
    const cats  = await this.prisma.page.findMany({ where: { site_id: site.id, page_type: 'category' }, take: 3 })

    // ★ DB 驱动 Layout（Phase 5.1）：优先读 site_component_instance，不存在 fallback 内存生成
    const generated = await this.layoutEngine.resolve(site.id, 'home', { play_count: plays.length, ad_count: ads.length, cat_count: cats.length })

    // 最新开奖
    const latestResult = await this.prisma.result.findFirst({
      where: { lottery_type: lotteryType },
      orderBy: { period: 'desc' },
    })
    const resultNumbers = latestResult
      ? await this.prisma.resultNumber.findMany({ where: { result_id: latestResult.id }, orderBy: { seq_no: 'asc' } })
      : []

    // SEO
    const seo = await this.buildSeo(site, lotteryType)

    // 统计（每个玩法的命中率）
    const playIds   = plays.map(p => p.id)
    const summaries = playIds.length > 0
      ? await this.prisma.statisticsSummary.findMany({ where: { play_id: { in: playIds }, lottery_type: lotteryType } })
      : []
    const statsMap: Map<string, any> = new Map(summaries.map(s => [s.play_id?.toString(), s]))

    // 构建 content_slots
    const content_slots = generated.slots.filter(s => !['logo','result_board','banner_slider','lottery_switch','bottom_nav'].includes(s.type)).map(slot => {
      if (slot.type === 'play_card' && slot.play_index !== undefined) {
        const play = plays[slot.play_index]
        if (!play) return null
        const stats = statsMap.get(play.id.toString())
        return {
          ...slot,
          data: {
            play_id:    play.id.toString(),
            name:       play.name,
            alias_name: play.alias_name,
            rule_code:  play.rule_code,
            lottery_type: play.lottery_type,
            hit_rate:   stats ? Number(stats.hit_rate) : null,
            last_10:    null, // 从 statistics_period 取
            period:     latestResult?.period ?? null,
            status:     'published',
          },
        }
      }
      if (slot.type === 'image_ad' && slot.ad_index !== undefined) {
        const ad = ads[slot.ad_index]
        if (!ad) return null
        return { ...slot, data: { ad_id: ad.id.toString(), title: ad.title, image_url: ad.image_url, target_url: ad.target_url } }
      }
      if (slot.type === 'category_entry' && slot.cat_index !== undefined) {
        const cat = cats[slot.cat_index]
        if (!cat) return null
        return { ...slot, data: { page_id: cat.id.toString(), name: cat.name, slug: cat.slug, page_type: cat.page_type } }
      }
      return slot
    }).filter(Boolean)

    return {
      site:         { id: site.id.toString(), name: site.name, code: site.code, domain: site.domain, status: site.status },
      theme:        { ...resolvedTheme, css_vars: this.themeEngine.toCssVars(resolvedTheme) },
      layout:       { code: generated.code, name: generated.name, lazy_initial: generated.lazy_initial, lazy_batch: generated.lazy_batch },
      seo,
      lazy_load:    { enabled: true, initial_count: generated.lazy_initial, batch_size: generated.lazy_batch },
      lottery_type: lotteryType,
      components: {
        logo:  { title: site.name, subtitle: lotteryType === 'hk' ? '香港六合彩' : '澳门六合彩', logo_url: null },
        result_board: {
          lottery_type: lotteryType,
          status:       latestResult ? 'published' : 'waiting',
          current_result: latestResult ? {
            period:  latestResult.period,
            numbers: resultNumbers.map(n => ({ seq_no: n.seq_no, number: n.number_value, zodiac: n.zodiac, wave: n.wave_color, element: n.element, is_special: n.seq_no === 7 })),
          } : null,
        },
        banner_slider:  { slides: [] },
        lottery_switch: { current: lotteryType, options: ['hk', 'macau'] },
        bottom_nav: {
          items: [
            { label: '首页', icon: 'home',       path: '/'           },
            { label: '开奖', icon: 'trophy',     path: '/results'    },
            { label: '统计', icon: 'chart',      path: '/statistics' },
            { label: '收藏', icon: 'star',       path: '/favorites'  },
          ],
        },
      },
      content_slots,
    }
  }

  // ─── 构建开奖记录页 ────────────────────────────────────────────────────

  async buildResultsPage(siteCode: string, lotteryType = 'hk', page = 1, limit = 20): Promise<ResultsPageData> {
    const site = await this.prisma.site.findFirst({ where: { code: siteCode } })
    const theme = await this.getSiteTheme(site)
    const seo   = await this.buildSeo(site, lotteryType, 'results')

    const skip  = (page - 1) * limit
    const [results, total] = await Promise.all([
      this.prisma.result.findMany({ where: { lottery_type: lotteryType }, orderBy: { period: 'desc' }, skip, take: limit }),
      this.prisma.result.count({ where: { lottery_type: lotteryType } }),
    ])

    const enriched = await Promise.all(results.map(async r => {
      const nums   = await this.prisma.resultNumber.findMany({ where: { result_id: r.id }, orderBy: { seq_no: 'asc' } })
      return {
        period:    r.period,
        draw_date: r.draw_date,
        numbers:   nums.map(n => ({ seq_no: n.seq_no, number: n.number_value, zodiac: n.zodiac, wave: n.wave_color, element: n.element, is_special: n.seq_no === 7 })),
      }
    }))

    return {
      site:         site ? { id: site.id.toString(), name: site.name } : null,
      theme:        { ...theme, css_vars: this.themeEngine.toCssVars(theme) },
      seo,
      lottery_type: lotteryType,
      results:      enriched,
      pagination:   { page, limit, total, pages: Math.ceil(total / limit) },
    }
  }

  // ─── 构建玩法详情页 ────────────────────────────────────────────────────

  async buildPlayDetailPage(siteCode: string, playId: bigint, lotteryType = 'hk'): Promise<PlayDetailPageData> {
    const site = await this.prisma.site.findFirst({ where: { code: siteCode } })
    const play = await this.prisma.play.findUnique({ where: { id: playId } })
    if (!play) return null

    const rule = play.rule_code ? await this.prisma.playRule.findFirst({ where: { rule_code: play.rule_code } }) : null
    const theme = await this.getSiteTheme(site)

    // 近100期结算
    const settlements = await this.prisma.settlementRecord.findMany({
      where: { play_id: playId, lottery_type: lotteryType },
      orderBy: { period: 'desc' },
      take: 100,
    })

    // 统计
    const summary = await this.prisma.statisticsSummary.findFirst({ where: { play_id: playId, lottery_type: lotteryType } })
    const periods = await this.prisma.statisticsPeriod.findMany({ where: { play_id: playId, lottery_type: lotteryType } })
    const pMap: Record<string, any> = Object.fromEntries(periods.map(p => [p.period_type, p]))

    const seo: SeoConfig = {
      title:       `${play.name} - 预测历史`,
      keywords:    `${play.name},${lotteryType === 'hk' ? '香港' : '澳门'}六合彩,预测`,
      description: `${play.name}历史预测数据与命中率统计`,
    }

    return {
      site:  site ? { id: site.id.toString(), name: site.name } : null,
      theme: { ...theme, css_vars: this.themeEngine.toCssVars(theme) },
      seo,
      play: { id: play.id.toString(), name: play.name, alias_name: play.alias_name, rule_code: play.rule_code, lottery_type: play.lottery_type },
      rule: rule ? { rule_code: rule.rule_code, rule_name: rule.rule_name, dsl: rule.dsl ? JSON.parse(rule.dsl) : null } : null,
      statistics: summary ? {
        total_rate:          Number(summary.hit_rate),
        last_10_rate:        Number(pMap['last_10']?.hit_rate  ?? 0),
        last_30_rate:        Number(pMap['last_30']?.hit_rate  ?? 0),
        last_100_rate:       Number(pMap['last_100']?.hit_rate ?? 0),
        total_count:         summary.total_count,
        hit_count:           summary.hit_count,
        miss_count:          summary.miss_count,
        current_hit_streak:  summary.current_hit_streak,
        current_miss_streak: summary.current_miss_streak,
        best_hit_streak:     summary.best_hit_streak,
        best_miss_streak:    summary.best_miss_streak,
        hidden_count:        summary.hidden_count,
      } : null,
      history: settlements.map(s => ({ period: s.period, hit: s.hit, status: s.status })),
    }
  }

  // ─── 构建统计页 ────────────────────────────────────────────────────────

  async buildStatisticsPage(siteCode: string, lotteryType = 'hk'): Promise<StatisticsPageData> {
    const site  = await this.prisma.site.findFirst({ where: { code: siteCode } })
    const theme = await this.getSiteTheme(site)
    const seo   = await this.buildSeo(site, lotteryType, 'statistics')

    // 排行榜
    const summaries = await this.prisma.statisticsSummary.findMany({
      where:   { lottery_type: lotteryType },
      orderBy: { hit_rate: 'desc' },
      take:    50,
    })
    const ranking = summaries.map((s, i) => ({
      rank:         i + 1,
      play_id:      s.play_id?.toString(),
      lottery_type: s.lottery_type,
      hit_rate:     Number(s.hit_rate),
      total_count:  s.total_count,
      hit_count:    s.hit_count,
    }))

    // 年度汇总
    const year = new Date().getFullYear()
    const totalHit   = summaries.reduce((s, x) => s + (x.hit_count   ?? 0), 0)
    const totalCount = summaries.reduce((s, x) => s + (x.total_count ?? 0), 0)
    const year_summary = { year, total_count: totalCount, hit_count: totalHit, rate: totalCount > 0 ? Math.round(totalHit / totalCount * 10000) / 100 : 0 }

    // 热门玩法（按期数最多）
    const hot_plays = await this.prisma.statisticsSummary.findMany({
      where: { lottery_type: lotteryType },
      orderBy: { total_count: 'desc' },
      take: 20,
    })

    return {
      site:         site ? { id: site.id.toString(), name: site.name } : null,
      theme:        { ...theme, css_vars: this.themeEngine.toCssVars(theme) },
      seo,
      lottery_type: lotteryType,
      ranking,
      year_summary,
      hot_plays: hot_plays.map(h => ({ play_id: h.play_id?.toString(), total_count: h.total_count, hit_rate: Number(h.hit_rate) })),
    }
  }

  // ─── 创建站点时初始化默认页面 ──────────────────────────────────────────

  async initDefaultPages(siteId: bigint) {
    const defaults = [
      { name: '首页',     slug: '/',           page_type: 'home'       },
      { name: '开奖记录', slug: '/results',    page_type: 'results'    },
      { name: '玩法详情', slug: '/play/:id',   page_type: 'play_detail'},
      { name: '统计中心', slug: '/statistics', page_type: 'statistics' },
      { name: '高手榜',   slug: '/hot',        page_type: 'category'   },
      { name: '历史回顾', slug: '/history',    page_type: 'category'   },
      { name: '资料中心', slug: '/data',       page_type: 'category'   },
    ]

    for (const p of defaults) {
      const exists = await this.prisma.page.findFirst({ where: { site_id: siteId, slug: p.slug } })
      if (!exists) {
        await this.prisma.page.create({
          data: {
            site_id: siteId, name: p.name, slug: p.slug, page_type: p.page_type,
            seo_title: p.name, created_at: new Date(),
          },
        })
      }
    }
  }

  // ─── 私有：加载站点主题 ───────────────────────────────────────────────

  private async getSiteTheme(site: any) {
    if (!site) return this.themeEngine.resolve('theme_default')
    const theme = site.theme_id ? await this.themeEngine.loadFromDb(site.theme_id) : null
    return theme ?? this.themeEngine.resolve('theme_default')
  }

  // ─── 私有：构建 SEO ───────────────────────────────────────────────────

  private async buildSeo(site: any, lotteryType: string, pageType = 'home'): Promise<SeoConfig> {
    const siteName = site?.name ?? 'AI预测站'
    const ltName   = lotteryType === 'hk' ? '香港六合彩' : '澳门六合彩'

    const titles: Record<string, string> = {
      home:       `${siteName} - ${ltName}免费精准预测`,
      results:    `${ltName}开奖记录 - ${siteName}`,
      statistics: `${ltName}命中率统计排行 - ${siteName}`,
      play_detail:`${ltName}玩法预测 - ${siteName}`,
    }
    return {
      title:       titles[pageType] ?? titles.home,
      keywords:    `平特一肖,六肖,${ltName},香港六合彩预测,澳门六合彩预测`,
      description: `${siteName}提供${ltName}精准预测数据，历史命中率统计，免费查看`,
    }
  }
}
