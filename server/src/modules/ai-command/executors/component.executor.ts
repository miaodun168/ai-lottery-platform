import { Injectable } from '@nestjs/common'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class ComponentExecutor implements IExecutor {
  readonly domains = ['component']

  constructor(
    private pageEditorService: PageEditorService,
    private prisma:            PrismaService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const siteId = dsl.site_id ? BigInt(dsl.site_id) : null
    const opId   = dsl.user_id ? BigInt(dsl.user_id) : null
    const pageType = dsl.params.page_type ?? 'home'

    switch (dsl.intent) {
      case 'add_component': {
        if (!siteId) return this.err('缺少 site_id')
        const inst = await this.pageEditorService.addComponent(siteId, pageType, {
          component_type: dsl.params.component_type ?? 'notice_board',
          template:       dsl.params.template ?? 'default',
        }, opId)
        return this.ok(`组件 ${dsl.params.component_type} 已添加`, inst)
      }

      case 'remove_component': {
        if (!siteId) return this.err('缺少 site_id')
        const cType = dsl.params.component_type
        if (!cType) return this.err('缺少 component_type')

        const instances = await this.prisma.siteComponentInstance.findMany({
          where: { site_id: siteId, page_type: pageType, component_type: cType },
          take:  1,
        })
        if (instances.length === 0) return this.err(`未找到组件 ${cType}`)

        await this.pageEditorService.removeComponent(siteId, pageType, instances[0].id, opId)
        return this.ok(`组件 ${cType} 已删除`)
      }

      case 'change_component_template': {
        if (!siteId) return this.err('缺少 site_id')
        const cType    = dsl.params.component_type ?? 'play_card'
        const template = dsl.params.template ?? 'card_01'

        // 批量更新所有该类型组件的模板
        const instances = await this.prisma.siteComponentInstance.findMany({
          where: { site_id: siteId, page_type: pageType, component_type: cType },
        })

        let updated = 0
        for (const inst of instances) {
          await this.pageEditorService.updateComponent(siteId, pageType, inst.id, { template }, opId)
          updated++
        }

        return this.ok(`已将 ${updated} 个 ${cType} 组件切换到模板 ${template}`)
      }

      default:
        return this.err(`未知组件操作: ${dsl.intent}`)
    }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true, message, data } }
  private err(message: string): ExecutionResult { return { success: false, message } }
}
