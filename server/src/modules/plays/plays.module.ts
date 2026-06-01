import { Module } from '@nestjs/common'
import { PlaysController } from './plays.controller'
import { PlaysService } from './plays.service'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  controllers: [PlaysController],
  providers:   [PlaysService, AuditLogService],
  exports:     [PlaysService],
})
export class PlaysModule {}
