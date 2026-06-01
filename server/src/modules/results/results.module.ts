import { Module } from '@nestjs/common'
import { ResultsController } from './results.controller'
import { ResultsService } from './results.service'
import { EnginesModule } from '../../engines/engines.module'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  imports:     [EnginesModule],
  controllers: [ResultsController],
  providers:   [ResultsService, AuditLogService],
  exports:     [ResultsService],
})
export class ResultsModule {}
