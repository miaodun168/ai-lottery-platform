import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { PredictionsService } from './predictions.service'
import { PredictionQueryDto } from './dto/prediction-query.dto'
import { YearPredictionQueryDto } from './dto/year-prediction-query.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('预测')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('year')
  findByYear(@Query() query: YearPredictionQueryDto) {
    return this.predictionsService.findByYear(query)
  }

  @Get()
  findAll(@Query() query: PredictionQueryDto) {
    return this.predictionsService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.predictionsService.findOne(BigInt(id))
  }
}
