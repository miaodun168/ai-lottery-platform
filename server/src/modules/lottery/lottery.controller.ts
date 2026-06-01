import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LotteryService } from './lottery.service'

@ApiTags('采种')
@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get('types')
  getTypes() {
    return this.lotteryService.getTypes()
  }
}
