import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { HkCalendarController } from './hk-calendar.controller'
import { HkCalendarService } from './hk-calendar.service'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  imports:     [MulterModule.register({ dest: './uploads' })],
  controllers: [HkCalendarController],
  providers:   [HkCalendarService, AuditLogService],
  exports:     [HkCalendarService],
})
export class HkCalendarModule {}
