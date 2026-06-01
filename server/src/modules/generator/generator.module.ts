import { Module } from '@nestjs/common'
import { GeneratorController } from './generator.controller'
import { GeneratorService } from './generator.service'
import { EnginesModule } from '../../engines/engines.module'
import { SettlementModule } from '../settlement/settlement.module'

@Module({
  imports:     [EnginesModule, SettlementModule],
  controllers: [GeneratorController],
  providers:   [GeneratorService],
  exports:     [GeneratorService],
})
export class GeneratorModule {}
