import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { StatisticsService } from './statistics.service'
import { StatisticsQueryDto } from './dto/statistics-query.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('统计管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Viewer')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: '玩法统计（总命中率 + 近10/30/100期）' })
  getStatistics(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getStatistics(query)
  }

  @Get('ranking')
  @ApiOperation({ summary: '命中率排行榜' })
  getRanking(@Query('lottery_type') lotteryType?: string) {
    return this.statisticsService.getRanking(lotteryType)
  }

  @Get('hot')
  @ApiOperation({ summary: '热门玩法' })
  getHot() {
    return this.statisticsService.getHot()
  }

  @Get('trend')
  @ApiOperation({ summary: '趋势图数据' })
  getTrend(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getTrend(query)
  }

  @Get('year')
  @ApiOperation({ summary: '年度统计汇总' })
  getYearSummary(
    @Query('year') year: string,
    @Query('lottery_type') lotteryType?: string,
  ) {
    return this.statisticsService.getYearSummary(parseInt(year || String(new Date().getFullYear())), lotteryType)
  }

  @Post('rebuild-all')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: '全量重算所有玩法统计' })
  rebuildAll(@Query('lottery_type') lotteryType?: string) {
    return this.statisticsService.rebuildAll(lotteryType)
  }
}
