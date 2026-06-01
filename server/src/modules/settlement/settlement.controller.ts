import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SettlementService } from './settlement.service'
import { SettlePeriodDto } from './dto/settle-period.dto'
import { SettleBatchDto } from './dto/settle-batch.dto'
import { SettleYearDto } from './dto/settle-year.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('结算')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('Admin', 'SuperAdmin')
@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('period')
  settlePeriod(@Body() dto: SettlePeriodDto) {
    return this.settlementService.settlePeriod(dto)
  }

  @Post('batch')
  settleBatch(@Body() dto: SettleBatchDto) {
    return this.settlementService.settleBatch(dto)
  }

  @Post('year')
  settleYear(@Body() dto: SettleYearDto) {
    return this.settlementService.settleYear(dto)
  }
}
