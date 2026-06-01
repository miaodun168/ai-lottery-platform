import { Module } from '@nestjs/common'
import { PageEditorController } from './page-editor.controller'
import { PageEditorService } from './page-editor.service'
import { EnginesModule } from '../../engines/engines.module'
import { AuditLogService } from '../../common/services/audit-log.service'

@Module({
  imports:     [EnginesModule],
  controllers: [PageEditorController],
  providers:   [PageEditorService, AuditLogService],
  exports:     [PageEditorService],
})
export class PageEditorModule {}
