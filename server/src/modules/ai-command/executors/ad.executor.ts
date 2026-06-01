import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class AdExecutor implements IExecutor {
  readonly domains = ['ad']

  constructor(
    private prisma:            PrismaService,
    private pageEditorService: PageEditorService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const siteId = dsl.site_id ? BigInt(dsl.site_id) : null
    const opId   = dsl.user_id ? BigInt(dsl.user_id) : null

    switch (dsl.intent) {
      case 'add_ad': {
        if (!siteId) return this.err('缺少 site_id')
        const count = dsl.params.count ?? 1
        const created: any[] = []

        for (let i = 0; i < count; i++) {
          const ad = await this.prisma.ad.create({
            data: {
              site_id:    siteId,
              title:      `广告位 ${i + 1}`,
              sort_no:    i,
              status:     true,
              created_at: new Date(),
            },
          })
          // 同时向首页 layout 添加 image_ad 组件实例
          try {
            await this.pageEditorService.addComponent(siteId, 'home', {
              component_type: 'image_ad',
              ad_index:       Number(ad.id),
              config:         { ad_id: ad.id.toString() },
            }, opId)
          } catch (_) {}
          created.push({ id: ad.id.toString(), title: ad.title })
        }

        return this.ok(`已添加 ${created.length} 个广告`, { ads: created })
      }

      case 'generate_ad': {
        if (!siteId) return this.err('缺少 site_id')
        const count = dsl.params.count ?? 1
        const theme = dsl.params.theme ?? 'default'

        const titles = ['限时优惠', '精准预测', '专业服务', '高命中率', '免费试用']
        const created: any[] = []

        for (let i = 0; i < count; i++) {
          const ad = await this.prisma.ad.create({
            data: {
              site_id:    siteId,
              title:      titles[i % titles.length],
              image_url:  null,
              target_url: '#',
              sort_no:    i,
              status:     true,
              created_at: new Date(),
            },
          })
          created.push({ id: ad.id.toString(), title: ad.title })
        }

        return this.ok(`已生成 ${created.length} 个 ${theme} 风格广告`, { ads: created })
      }

      case 'remove_ad': {
        if (!siteId) return this.err('缺少 site_id')
        const count = dsl.params.count ?? 1

        const ads = await this.prisma.ad.findMany({
          where:   { site_id: siteId },
          orderBy: { sort_no: 'desc' },
          take:    count,
        })
        for (const ad of ads) {
          await this.prisma.ad.update({ where: { id: ad.id }, data: { status: false } })
        }

        return this.ok(`已停用 ${ads.length} 个广告`)
      }

      case 'remove_all_ads': {
        if (!siteId) return this.err('缺少 site_id')
        const result = await this.prisma.ad.updateMany({
          where: { site_id: siteId },
          data:  { status: false },
        })
        return this.ok(`已停用所有广告（${result.count} 个）`)
      }

      default:
        return this.err(`未知广告操作: ${dsl.intent}`)
    }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true, message, data } }
  private err(message: string): ExecutionResult { return { success: false, message } }
}
