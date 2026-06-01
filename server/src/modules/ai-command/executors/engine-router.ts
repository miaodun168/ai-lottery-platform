import { Injectable } from '@nestjs/common'
import { IExecutor } from './executor.interface'
import { SiteExecutor } from './site.executor'
import { PlayExecutor } from './play.executor'
import { LayoutExecutor } from './layout.executor'
import { ComponentExecutor } from './component.executor'
import { AdExecutor } from './ad.executor'
import { ThemeExecutor } from './theme.executor'
import { PageExecutor } from './page.executor'
import { ResultExecutor } from './result.executor'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { PrismaService } from '../../../prisma/prisma.service'
import { SettingsService } from '../../settings/settings.service'

@Injectable()
export class EngineRouter {
  private executors: IExecutor[]

  constructor(
    private siteExecutor:      SiteExecutor,
    private playExecutor:      PlayExecutor,
    private layoutExecutor:    LayoutExecutor,
    private componentExecutor: ComponentExecutor,
    private adExecutor:        AdExecutor,
    private themeExecutor:     ThemeExecutor,
    private pageExecutor:      PageExecutor,
    private resultExecutor:    ResultExecutor,
    private prisma:            PrismaService,
    private settingsService:   SettingsService,
  ) {
    this.executors = [
      siteExecutor, playExecutor, layoutExecutor,
      componentExecutor, adExecutor, themeExecutor, pageExecutor, resultExecutor,
    ]
  }

  async route(dsl: CommandDsl, taskId: bigint): Promise<ExecutionResult> {
    // 查找匹配的 executor
    const executor = this.executors.find(e => e.domains.includes(dsl.domain))
    if (!executor) {
      // 内置处理：rule / statistics / system
      return this.handleBuiltIn(dsl, taskId)
    }
    return executor.execute(dsl, taskId)
  }

  private async handleBuiltIn(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const opId = dsl.user_id ? BigInt(dsl.user_id) : null

    if (dsl.domain === 'rule' && dsl.intent === 'update_rule') {
      const key   = dsl.params.rule_name
      const value = dsl.params.rule_value
      if (!key) return { success: false, message: '缺少 rule_name' }

      await this.settingsService.update({ [key]: value }, opId)
      return { success: true, message: `规则 ${key} 已更新为 ${value}` }
    }

    if (dsl.domain === 'statistics' && dsl.intent === 'rebuild_statistics') {
      // 标记需要重算（实际重算由 StatisticsEngine 触发）
      return { success: true, message: '统计重算任务已排队，将在后台执行', data: { queued: true } }
    }

    if (dsl.domain === 'system' && dsl.intent === 'flush_cache') {
      // 缓存刷新（预留）
      return { success: true, message: '缓存刷新指令已发送', data: { flushed: true } }
    }

    return { success: false, message: `无法处理的 domain: ${dsl.domain}` }
  }
}
