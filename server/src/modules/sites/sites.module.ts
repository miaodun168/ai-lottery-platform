import { Module } from '@nestjs/common'
import { SitesController } from './sites.controller'
import { SitesService } from './sites.service'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  controllers: [SitesController],
  providers:   [SitesService, AuditLogService],
  exports:     [SitesService],
})
export class SitesModule {}
