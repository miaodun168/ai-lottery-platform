import { Injectable } from '@nestjs/common'
import { SitesService } from '../../sites/sites.service'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class SiteExecutor implements IExecutor {
  readonly domains = ['site']

  constructor(
    private sitesService:     SitesService,
    private pageEditorService: PageEditorService,
  ) {}

  async execute(dsl: CommandDsl, taskId: bigint): Promise<ExecutionResult> {
    const p = dsl.params

    switch (dsl.intent) {
      case 'site_create':
        return this.createSite(dsl, taskId)

      case 'site_publish':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.publish(BigInt(dsl.site_id))
        return this.ok('站点已发布')

      case 'site_suspend':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.suspend(BigInt(dsl.site_id))
        return this.ok('站点已暂停')

      case 'site_delete':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.remove(BigInt(dsl.site_id))
        return this.ok('站点已删除')

      case 'site_clone':
        return this.cloneSite(dsl, taskId)

      default:
        return this.err(`未知操作: ${dsl.intent}`)
    }
  }

  private async createSite(dsl: CommandDsl, taskId: bigint): Promise<ExecutionResult> {
    const p = dsl.params
    const operatorId = dsl.user_id ? BigInt(dsl.user_id) : null

    // 1. 创建站点
    const site = await this.sitesService.create({
      name:          p.site_name ?? `站点_${Date.now()}`,
      lottery_types: p.lottery_type ? [p.lottery_type] : ['hk'],
      theme:         p.theme ?? 'theme_default',
      layout:        p.layout_code ?? 'layout_a',
    }, operatorId)

    // 2. 初始化默认页面（首页/开奖/统计/详情）
    const pageTypes = ['home', 'results', 'play_detail', 'statistics']
    for (const pt of pageTypes) {
      try {
        await this.pageEditorService.initPage(BigInt(site.id), {
          page_type:   pt,
          layout_code: p.layout_code ?? 'layout_a',
          play_count:  Number(p.play_count ?? 50)  || 50,
          ad_count:    Number(p.ad_count   ?? 10)  || 10,
          cat_count:   Number(p.cat_count  ?? 3)   || 3,
        }, operatorId)
      } catch (_) {
        // 已初始化则跳过
      }
    }

    return {
      success: true,
      message: `站点 "${site.name}" 创建成功，已初始化 ${pageTypes.length} 个页面`,
      data:    { site_id: site.id, site_name: site.name },
      rollback_id: `site:${site.id}`,
    }
  }

  private async cloneSite(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const source = await this.sitesService.findAll()
    const src = source.find(s => s.name === dsl.params.site_name)
    if (!src) return this.err(`源站点 "${dsl.params.site_name}" 不存在`)

    const cloned = await this.sitesService.create({
      name:    `${src.name}_副本_${Date.now()}`,
      theme:   src.theme_id ?? undefined,
      layout:  src.layout_id ?? undefined,
    }, dsl.user_id ? BigInt(dsl.user_id) : null)

    return { success: true, message: `站点已复制，新站点 ID: ${cloned.id}`, data: cloned }
  }

  private ok(message: string, data?: any): ExecutionResult {
    return { success: true, message, data }
  }

  private err(message: string): ExecutionResult {
    return { success: false, message }
  }
}
