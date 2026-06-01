import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ResultsService } from './results.service'
import { CreateResultDto } from './dto/create-result.dto'
import { UpdateResultDto } from './dto/update-result.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('开奖管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @Roles('Viewer')
  @ApiOperation({ summary: '开奖列表' })
  findAll(
    @Query('lottery_type') lotteryType?: string,
    @Query('year') year?: string,
  ) {
    return this.resultsService.findAll({ lottery_type: lotteryType, year })
  }

  @Get(':id')
  @Roles('Viewer')
  @ApiOperation({ summary: '开奖详情（含属性快照）' })
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(BigInt(id))
  }

  @Post()
  @Roles('Operator')
  @ApiOperation({ summary: '录入开奖结果（自动触发属性计算→结算→统计）' })
  create(@Body() dto: CreateResultDto, @CurrentUser() user: JwtUser) {
    return this.resultsService.create(dto, user.id)
  }

  @Put(':id')
  @Roles('Operator')
  @ApiOperation({ summary: '修改开奖结果（自动触发重算）' })
  update(@Param('id') id: string, @Body() dto: UpdateResultDto, @CurrentUser() user: JwtUser) {
    return this.resultsService.update(BigInt(id), dto, user.id)
  }
}
