import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PublicService } from './public.service'

@ApiTags('前台公开接口')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // ─── 主题和布局元数据 ──────────────────────────────────────────────────

  @Get('themes')
  @ApiOperation({ summary: '主题列表' })
  getThemeList() {
    return this.publicService.getThemeList()
  }

  @Get('layouts')
  @ApiOperation({ summary: '布局列表' })
  getLayoutList() {
    return this.publicService.getLayoutList()
  }

  // ─── 站点主题 ─────────────────────────────────────────────────────────

  @Get(':site_code/theme')
  @ApiOperation({ summary: '站点主题（含 CSS 变量）' })
  getSiteTheme(@Param('site_code') siteCode: string) {
    return this.publicService.getSiteTheme(siteCode)
  }

  // ─── 首页（含开奖组件、玩法列表、广告、栏目、SEO）────────────────────

  @Get(':site_code/home')
  @ApiOperation({ summary: '首页完整数据（Layout + 组件树 + 内容）' })
  getHome(
    @Param('site_code') siteCode: string,
    @Query('lottery_type') lotteryType = 'hk',
  ) {
    return this.publicService.getHome(siteCode, lotteryType)
  }

  // ─── 玩法懒加载（分页）────────────────────────────────────────────────

  @Get(':site_code/plays')
  @ApiOperation({ summary: '玩法列表（分页懒加载）' })
  getPlaysLazy(
    @Param('site_code') siteCode: string,
    @Query('lottery_type') lotteryType = 'hk',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.publicService.getPlaysLazy(siteCode, lotteryType, parseInt(page), parseInt(limit))
  }

  // ─── 玩法详情页 ────────────────────────────────────────────────────────

  @Get(':site_code/plays/:play_id')
  @ApiOperation({ summary: '玩法详情页（预测历史 + 统计 + 趋势）' })
  getPlayDetail(
    @Param('site_code') siteCode: string,
    @Param('play_id') playId: string,
    @Query('lottery_type') lotteryType = 'hk',
  ) {
    return this.publicService.getPlayDetail(siteCode, playId, lotteryType)
  }

  // ─── 开奖记录页 ────────────────────────────────────────────────────────

  @Get(':site_code/results')
  @ApiOperation({ summary: '开奖记录页（分页 + 号码属性）' })
  getResults(
    @Param('site_code') siteCode: string,
    @Query('lottery_type') lotteryType = 'hk',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.publicService.getResults(siteCode, lotteryType, parseInt(page), parseInt(limit))
  }

  // ─── 统计页 ────────────────────────────────────────────────────────────

  @Get(':site_code/statistics')
  @ApiOperation({ summary: '统计页（排行榜 + 年度汇总 + 热门玩法）' })
  getStatistics(
    @Param('site_code') siteCode: string,
    @Query('lottery_type') lotteryType = 'hk',
  ) {
    return this.publicService.getStatistics(siteCode, lotteryType)
  }
}
