import { Module } from '@nestjs/common'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  controllers: [AdminUsersController],
  providers:   [AdminUsersService, AuditLogService],
})
export class AdminUsersModule {}
