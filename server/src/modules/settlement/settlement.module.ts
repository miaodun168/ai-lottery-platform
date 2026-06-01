import { Module } from '@nestjs/common'
import { SettlementController } from './settlement.controller'
import { SettlementService } from './settlement.service'
import { EnginesModule } from '../../engines/engines.module'

@Module({
  imports:     [EnginesModule],
  controllers: [SettlementController],
  providers:   [SettlementService],
  exports:     [SettlementService],
})
export class SettlementModule {}
