import { Injectable } from '@nestjs/common'
import { SitesService } from '../../sites/sites.service'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class LayoutExecutor implements IExecutor {
  readonly domains = ['layout']

  constructor(
    private sitesService:     SitesService,
    private pageEditorService: PageEditorService,
    private prisma:            PrismaService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const siteId = dsl.site_id ? BigInt(dsl.site_id) : null
    const opId   = dsl.user_id ? BigInt(dsl.user_id) : null

    switch (dsl.intent) {
      case 'change_layout': {
        if (!siteId) return this.err('缺少 site_id')
        const layout = await this.prisma.layout.findFirst({ where: { layout_code: dsl.params.layout_code ?? 'layout_a' } })
        if (!layout) return this.err(`布局 ${dsl.params.layout_code} 不存在`)
        await this.sitesService.applyLayout(siteId, { layout_id: Number(layout.id) }, opId)
        return this.ok(`布局已切换为 ${dsl.params.layout_code}`)
      }

      case 'modify_layout': {
        if (!siteId) return this.err('缺少 site_id')
        const adCount = dsl.params.ad_count

        let newInterval: number | undefined
        if (typeof adCount === 'string' && adCount.includes('%')) {
          // 百分比处理："-50%" 表示减半广告密度（增大间隔）
          const pct = parseInt(adCount) // -50
          const current = await this.getCurrentAdInterval(siteId)
          newInterval = Math.max(3, Math.round(current * (1 - pct / 100)))
        } else if (typeof adCount === 'number') {
          newInterval = undefined // 直接设 ad_count 不支持，忽略
        }

        await this.pageEditorService.updateLayoutConfig(siteId, 'home', {
          ad_interval: newInterval,
        }, opId)

        return this.ok(`布局广告参数已更新`)
      }

      case 'add_play_modules': {
        if (!siteId) return this.err('缺少 site_id')
        const count = dsl.params.count ?? 10

        // 在首页追加 play_card 组件实例
        let added = 0
        for (let i = 0; i < count; i++) {
          try {
            await this.pageEditorService.addComponent(siteId, 'home', {
              component_type: 'play_card',
              template:       'card_01',
            }, opId)
            added++
          } catch (_) {}
        }

        return this.ok(`已添加 ${added} 个玩法模块到首页`)
      }

      case 'move_component': {
        if (!siteId) return this.err('缺少 site_id')
        const cType    = dsl.params.component_type
        const position = dsl.params.position

        if (!cType) return this.err('缺少 component_type')

        // 查找组件实例
        const instances = await this.prisma.siteComponentInstance.findMany({
          where:   { site_id: siteId, page_type: 'home', component_type: cType },
          orderBy: { sort: 'asc' },
        })
        if (instances.length === 0) return this.err(`未找到组件 ${cType}`)

        // 获取所有实例并重排
        const all = await this.prisma.siteComponentInstance.findMany({
          where:   { site_id: siteId, page_type: 'home' },
          orderBy: { sort: 'asc' },
        })

        const movingIds  = instances.map(i => i.id.toString())
        const restIds    = all.filter(i => !movingIds.includes(i.id.toString())).map(i => i.id.toString())

        let newOrder: string[]
        if (position === 'top') {
          newOrder = [...movingIds, ...restIds]
        } else {
          newOrder = [...restIds, ...movingIds]
        }

        await this.pageEditorService.sortComponents(siteId, 'home', { ids: newOrder }, opId)
        return this.ok(`组件 ${cType} 已移动到 ${position === 'top' ? '顶部' : '底部'}`)
      }

      default:
        return this.err(`未知布局操作: ${dsl.intent}`)
    }
  }

  private async getCurrentAdInterval(siteId: bigint): Promise<number> {
    const dsl = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: 'home', is_active: true },
    })
    return (dsl?.dsl as any)?.ad_config?.interval ?? 5
  }

  private ok(message: string, data?: any): ExecutionResult {
    return { success: true, message, data }
  }

  private err(message: string): ExecutionResult {
    return { success: false, message }
  }
}
