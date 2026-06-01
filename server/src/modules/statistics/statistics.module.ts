import { Module } from '@nestjs/common'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'
import { EnginesModule } from '../../engines/engines.module'

@Module({
  imports:     [EnginesModule],
  controllers: [StatisticsController],
  providers:   [StatisticsService],
  exports:     [StatisticsService],
})
export class StatisticsModule {}
