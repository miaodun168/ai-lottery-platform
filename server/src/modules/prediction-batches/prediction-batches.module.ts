import { Module } from '@nestjs/common'
import { PredictionBatchesController } from './prediction-batches.controller'
import { PredictionBatchesService } from './prediction-batches.service'

@Module({
  controllers: [PredictionBatchesController],
  providers: [PredictionBatchesService],
})
export class PredictionBatchesModule {}
