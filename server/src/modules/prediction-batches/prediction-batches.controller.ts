import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { PredictionBatchesService } from './prediction-batches.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('预测批次')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prediction-batches')
export class PredictionBatchesController {
  constructor(private readonly predictionBatchesService: PredictionBatchesService) {}

  @Get()
  findAll() {
    return this.predictionBatchesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.predictionBatchesService.findOne(BigInt(id))
  }

  @Post(':id/rollback')
  rollback(@Param('id') id: string) {
    return this.predictionBatchesService.rollback(BigInt(id))
  }
}
