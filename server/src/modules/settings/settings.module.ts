import { Module } from '@nestjs/common'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  controllers: [SettingsController],
  providers:   [SettingsService, AuditLogService],
  exports:     [SettingsService],
})
export class SettingsModule {}
