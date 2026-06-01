import { Injectable } from '@nestjs/common'
import { SitesService } from '../../sites/sites.service'
import { SettingsService } from '../../settings/settings.service'
import { ThemeEngine } from '../../../engines/theme/theme.engine'
import { PrismaService } from '../../../prisma/prisma.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class ThemeExecutor implements IExecutor {
  readonly domains = ['theme']

  constructor(
    private sitesService:  SitesService,
    private themeEngine:   ThemeEngine,
    private prisma:        PrismaService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const siteId = dsl.site_id ? BigInt(dsl.site_id) : null
    const opId   = dsl.user_id ? BigInt(dsl.user_id) : null

    switch (dsl.intent) {
      case 'change_theme': {
        if (!siteId) return this.err('缺少 site_id')
        const themeCode = dsl.params.theme ?? 'theme_default'

        // 查找或创建主题 DB 记录
        let themeRecord = await this.prisma.theme.findFirst({ where: { theme_code: themeCode } })
        if (!themeRecord) {
          // 从常量库同步到 DB
          await this.themeEngine.syncToDb()
          themeRecord = await this.prisma.theme.findFirst({ where: { theme_code: themeCode } })
        }
        if (!themeRecord) return this.err(`主题 ${themeCode} 不存在`)

        await this.sitesService.applyTheme(siteId, { theme_id: Number(themeRecord.id) }, opId)
        return this.ok(`主题已切换为 ${themeCode}`, { theme_code: themeCode })
      }

      case 'create_theme': {
        // 以常量库中的默认主题为基础创建自定义主题
        const newCode = `theme_custom_${Date.now()}`
        const base    = this.themeEngine.resolve('theme_default')
        const newConfig = { ...base, theme_code: newCode, name: dsl.params.theme ?? '自定义主题' }

        const created = await this.prisma.theme.create({
          data: {
            theme_code:  newCode,
            theme_name:  newConfig.name,
            config_json: newConfig as any,
            created_at:  new Date(),
          },
        })
        return this.ok(`主题 "${newConfig.name}" 已创建`, { theme_id: created.id.toString(), theme_code: newCode })
      }

      case 'modify_theme': {
        // 主题样式修改（记录意图，返回 preview）
        return {
          success: true,
          message: '主题修改已记录',
          preview: { description: dsl.params.keyword ?? '修改主题样式', note: '请在后台主题编辑器中应用' },
        }
      }

      default:
        return this.err(`未知主题操作: ${dsl.intent}`)
    }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true, message, data } }
  private err(message: string): ExecutionResult { return { success: false, message } }
}
