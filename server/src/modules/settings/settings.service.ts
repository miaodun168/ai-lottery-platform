import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class SettingsService {
  constructor(
    private prisma:   PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async getAll(): Promise<Record<string, any>> {
    const rows = await this.prisma.systemSetting.findMany({ orderBy: { setting_key: 'asc' } })
    const result: Record<string, any> = {}
    for (const row of rows) {
      try { result[row.setting_key!] = JSON.parse(row.setting_value!) }
      catch { result[row.setting_key!] = row.setting_value }
    }
    return result
  }

  async update(dto: UpdateSettingsDto, operatorId?: bigint): Promise<Record<string, any>> {
    const entries = Object.entries(dto).filter(([, v]) => v !== undefined)
    for (const [key, value] of entries) {
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      await this.prisma.systemSetting.upsert({
        where:  { setting_key: key },
        update: { setting_value: strValue, updated_at: new Date() },
        create: { setting_key: key, setting_value: strValue, updated_at: new Date() },
      })
    }
    await this.auditLog.log(operatorId ?? null, 'UPDATE_SETTINGS', 'system_setting', null, dto as any)
    return this.getAll()
  }
}
