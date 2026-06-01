import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class PageExecutor implements IExecutor {
  readonly domains = ['page']

  constructor(
    private prisma:            PrismaService,
    private pageEditorService: PageEditorService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const siteId = dsl.site_id ? BigInt(dsl.site_id) : null
    const opId   = dsl.user_id ? BigInt(dsl.user_id) : null

    switch (dsl.intent) {
      case 'create_page': {
        if (!siteId) return this.err('缺少 site_id')
        const name  = dsl.params.page_name ?? '新页面'
        const slug  = `/${name.toLowerCase().replace(/\s+/g, '-')}`

        const page = await this.prisma.page.create({
          data: {
            site_id:    siteId,
            name,
            slug,
            page_type:  'custom',
            seo_title:  name,
            created_at: new Date(),
          },
        })

        // 初始化页面组件
        try {
          await this.pageEditorService.initPage(siteId, {
            page_type:   'category',
            layout_code: 'layout_a',
          }, opId)
        } catch (_) {}

        return this.ok(`页面 "${name}" 已创建`, { page_id: page.id.toString(), slug })
      }

      case 'delete_page': {
        if (!siteId) return this.err('缺少 site_id')
        const name = dsl.params.page_name ?? ''

        const page = await this.prisma.page.findFirst({
          where: { site_id: siteId, name: { contains: name } },
        })
        if (!page) return this.err(`页面 "${name}" 不存在`)

        // 软删除（标记状态）
        await this.prisma.page.update({ where: { id: page.id }, data: { seo_title: `[已删除] ${page.seo_title}` } })
        return this.ok(`页面 "${name}" 已删除`)
      }

      default:
        return this.err(`未知页面操作: ${dsl.intent}`)
    }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true, message, data } }
  private err(message: string): ExecutionResult { return { success: false, message } }
}
