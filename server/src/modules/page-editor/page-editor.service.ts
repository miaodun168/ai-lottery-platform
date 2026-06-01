import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { LayoutEngine } from '../../engines/layout/layout.engine'
import { AuditLogService } from '../../common/services/audit-log.service'
import { COMPONENT_DEFINITIONS } from '../../engines/layout/layout.constants'
import {
  InitPageDto, AddComponentDto, UpdateComponentDto,
  SortComponentsDto, UpdateLayoutConfigDto,
  ComponentDslItem, PageDslDoc,
} from './dto/index'

@Injectable()
export class PageEditorService {
  constructor(
    private prisma:        PrismaService,
    private layoutEngine:  LayoutEngine,
    private auditLog:      AuditLogService,
  ) {}

  // ─── 1. 初始化页面（首次生成所有组件实例 + 保存 DSL）────────────────────

  async initPage(siteId: bigint, dto: InitPageDto, operatorId?: bigint) {
    const existing = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: dto.page_type, is_active: true },
    })
    if (existing) throw new ConflictException(`页面 ${dto.page_type} 已初始化，如需重置请先删除`)

    const layoutCode = dto.layout_code ?? 'layout_a'
    const generated  = this.layoutEngine.generate(layoutCode, {
      play_count: dto.play_count,
      ad_count:   dto.ad_count,
      cat_count:  dto.cat_count,
    })

    // 批量插入组件实例
    const instances = await this.prisma.$transaction(async tx => {
      const created: any[] = []
      for (const slot of generated.slots) {
        const def = COMPONENT_DEFINITIONS[slot.type]
        const inst = await tx.siteComponentInstance.create({
          data: {
            site_id:        siteId,
            page_type:      dto.page_type,
            component_type: slot.type,
            sort:           slot.sort,
            visible:        true,
            template:       slot.template ?? 'default',
            config_json:    {},
            play_index:     slot.play_index ?? null,
            ad_index:       slot.ad_index   ?? null,
            cat_index:      slot.cat_index  ?? null,
            is_fixed:       def?.fixed ?? false,
            created_at:     new Date(),
            updated_at:     new Date(),
          },
        })
        created.push(inst)
      }
      return created
    })

    // 构建并保存 DSL
    const dsl = this.buildDsl(siteId.toString(), dto.page_type, instances, generated)
    await this.prisma.pageLayoutDsl.create({
      data: {
        site_id:    siteId,
        page_type:  dto.page_type,
        dsl:        dsl as any,
        version:    1,
        is_active:  true,
        created_by: operatorId ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    await this.auditLog.log(operatorId ?? null, 'INIT_PAGE', 'page_layout_dsl', null, { page_type: dto.page_type, layout_code: layoutCode })
    return { page_type: dto.page_type, component_count: instances.length, layout_code: layoutCode }
  }

  // ─── 2. 新增组件 ─────────────────────────────────────────────────────────

  async addComponent(siteId: bigint, pageType: string, dto: AddComponentDto, operatorId?: bigint) {
    this.ensureValidPageType(pageType)

    // 固定组件（L1）只能有一个
    const def = COMPONENT_DEFINITIONS[dto.component_type]
    if (def?.fixed) throw new BadRequestException(`${dto.component_type} 是固定组件，不允许手动新增`)

    // 如果有 sort，后移现有组件
    const targetSort = dto.sort ?? await this.getNextSort(siteId, pageType)
    if (dto.sort !== undefined) {
      await this.prisma.siteComponentInstance.updateMany({
        where: { site_id: siteId, page_type: pageType, sort: { gte: targetSort } },
        data:  { sort: { increment: 1 } },
      })
    }

    const inst = await this.prisma.siteComponentInstance.create({
      data: {
        site_id: siteId, page_type: pageType,
        component_type: dto.component_type,
        sort:           targetSort,
        visible:        true,
        template:       dto.template ?? 'default',
        config_json:    dto.config   ?? {},
        play_index:     dto.play_index ?? null,
        ad_index:       dto.ad_index   ?? null,
        cat_index:      dto.cat_index  ?? null,
        is_fixed:       false,
        created_at:     new Date(),
        updated_at:     new Date(),
      },
    })

    await this.syncDsl(siteId, pageType, operatorId)
    await this.auditLog.log(operatorId ?? null, 'ADD_COMPONENT', 'site_component_instance', inst.id, { component_type: dto.component_type })
    return this.formatInst(inst)
  }

  // ─── 3. 删除组件 ─────────────────────────────────────────────────────────

  async removeComponent(siteId: bigint, pageType: string, instanceId: bigint, operatorId?: bigint) {
    const inst = await this.prisma.siteComponentInstance.findUnique({ where: { id: instanceId } })
    if (!inst || inst.site_id !== siteId || inst.page_type !== pageType) throw new NotFoundException('组件实例不存在')
    if (inst.is_fixed) throw new BadRequestException('固定组件不允许删除')

    await this.prisma.siteComponentInstance.delete({ where: { id: instanceId } })
    await this.syncDsl(siteId, pageType, operatorId)
    await this.auditLog.log(operatorId ?? null, 'REMOVE_COMPONENT', 'site_component_instance', instanceId, { component_type: inst.component_type })
    return { success: true }
  }

  // ─── 4. 修改组件（模板 / visible / config）────────────────────────────────

  async updateComponent(siteId: bigint, pageType: string, instanceId: bigint, dto: UpdateComponentDto, operatorId?: bigint) {
    const inst = await this.prisma.siteComponentInstance.findUnique({ where: { id: instanceId } })
    if (!inst || inst.site_id !== siteId) throw new NotFoundException('组件实例不存在')
    if (inst.is_fixed && dto.visible === false) throw new BadRequestException('固定组件不允许隐藏')

    const updated = await this.prisma.siteComponentInstance.update({
      where: { id: instanceId },
      data: {
        template:    dto.template !== undefined ? dto.template  : undefined,
        visible:     dto.visible  !== undefined ? dto.visible   : undefined,
        config_json: dto.config   !== undefined ? dto.config    : undefined,
        updated_at:  new Date(),
      },
    })

    await this.syncDsl(siteId, pageType, operatorId)
    await this.auditLog.log(operatorId ?? null, 'UPDATE_COMPONENT', 'site_component_instance', instanceId, dto as any)
    return this.formatInst(updated)
  }

  // ─── 5. 拖拽排序（批量更新 sort）─────────────────────────────────────────

  async sortComponents(siteId: bigint, pageType: string, dto: SortComponentsDto, operatorId?: bigint) {
    const ids = dto.ids.map(id => BigInt(id))

    // 验证所有 id 属于本站点本页面
    const instances = await this.prisma.siteComponentInstance.findMany({
      where: { id: { in: ids }, site_id: siteId, page_type: pageType },
    })
    if (instances.length !== ids.length) throw new BadRequestException('包含无效的组件实例 ID')

    // 批量更新 sort
    await this.prisma.$transaction(
      ids.map((id, idx) =>
        this.prisma.siteComponentInstance.update({ where: { id }, data: { sort: idx, updated_at: new Date() } })
      )
    )

    await this.syncDsl(siteId, pageType, operatorId)
    await this.auditLog.log(operatorId ?? null, 'SORT_COMPONENTS', 'site_component_instance', null, { page_type: pageType, new_order: dto.ids })
    return { success: true, sorted_count: ids.length }
  }

  // ─── 6 & 7. 修改广告/栏目位置（更新 DSL meta）───────────────────────────

  async updateLayoutConfig(siteId: bigint, pageType: string, dto: UpdateLayoutConfigDto, operatorId?: bigint) {
    const dslRecord = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: pageType, is_active: true },
    })
    if (!dslRecord) throw new NotFoundException('页面 DSL 不存在，请先初始化')

    const current = dslRecord.dsl as any
    const updated = {
      ...current,
      ad_config:  {
        ...current.ad_config,
        interval: dto.ad_interval ?? current.ad_config?.interval ?? 5,
      },
      cat_config: {
        ...current.cat_config,
        positions: dto.cat_positions ?? current.cat_config?.positions ?? [9, 24, 39],
      },
      lazy: {
        ...current.lazy,
        initial: dto.lazy_initial ?? current.lazy?.initial ?? 10,
        batch:   dto.lazy_batch   ?? current.lazy?.batch   ?? 5,
      },
      updated_at: new Date().toISOString(),
    }

    await this.prisma.pageLayoutDsl.update({
      where:  { id: dslRecord.id },
      data:   { dsl: updated, version: { increment: 1 }, updated_at: new Date() },
    })

    await this.auditLog.log(operatorId ?? null, 'UPDATE_LAYOUT_CONFIG', 'page_layout_dsl', dslRecord.id, dto as any)
    return { success: true, dsl: updated }
  }

  // ─── 8. 保存当前状态为 DSL ────────────────────────────────────────────────

  async saveDsl(siteId: bigint, pageType: string, operatorId?: bigint) {
    await this.syncDsl(siteId, pageType, operatorId)
    const record = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: pageType, is_active: true },
    })
    await this.auditLog.log(operatorId ?? null, 'SAVE_DSL', 'page_layout_dsl', record?.id ?? null)
    return { success: true, version: record?.version, saved_at: new Date().toISOString() }
  }

  // ─── 9. 导出 DSL ─────────────────────────────────────────────────────────

  async exportDsl(siteId: bigint, pageType: string): Promise<PageDslDoc> {
    const instances = await this.prisma.siteComponentInstance.findMany({
      where: { site_id: siteId, page_type: pageType }, orderBy: { sort: 'asc' },
    })
    const dslRecord = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: pageType, is_active: true },
    })
    const meta = (dslRecord?.dsl as any) ?? {}
    const generated = this.layoutEngine.generate(meta.layout_code ?? 'layout_a')

    return this.buildDsl(siteId.toString(), pageType, instances, generated, meta)
  }

  // ─── 10. 导入 DSL ────────────────────────────────────────────────────────

  async importDsl(siteId: bigint, pageType: string, dsl: PageDslDoc, operatorId?: bigint) {
    if (!dsl.components || !Array.isArray(dsl.components)) throw new BadRequestException('DSL 格式错误：缺少 components 数组')
    if (dsl.page_type !== pageType) throw new BadRequestException(`DSL page_type (${dsl.page_type}) 与路径不匹配 (${pageType})`)

    // 事务：删旧实例 + 写新实例 + 更新 DSL
    await this.prisma.$transaction(async tx => {
      await tx.siteComponentInstance.deleteMany({ where: { site_id: siteId, page_type: pageType } })

      for (const c of dsl.components) {
        await tx.siteComponentInstance.create({
          data: {
            site_id: siteId, page_type: pageType,
            component_type: c.component_type,
            sort:        c.sort,
            visible:     c.visible,
            template:    c.template  ?? 'default',
            config_json: c.config    ?? {},
            play_index:  c.play_index ?? null,
            ad_index:    c.ad_index   ?? null,
            cat_index:   c.cat_index  ?? null,
            is_fixed:    c.is_fixed,
            created_at:  new Date(),
            updated_at:  new Date(),
          },
        })
      }

      const existing = await tx.pageLayoutDsl.findFirst({ where: { site_id: siteId, page_type: pageType } })
      const newDsl = { ...dsl, imported_at: new Date().toISOString() }
      if (existing) {
        await tx.pageLayoutDsl.update({ where: { id: existing.id }, data: { dsl: newDsl as any, version: { increment: 1 }, is_active: true, updated_at: new Date() } })
      } else {
        await tx.pageLayoutDsl.create({ data: { site_id: siteId, page_type: pageType, dsl: newDsl as any, version: 1, is_active: true, created_by: operatorId ?? null, created_at: new Date(), updated_at: new Date() } })
      }
    })

    await this.auditLog.log(operatorId ?? null, 'IMPORT_DSL', 'page_layout_dsl', null, { page_type: pageType, component_count: dsl.components.length })
    return { success: true, imported_count: dsl.components.length }
  }

  // ─── 查询：页面组件列表 ───────────────────────────────────────────────────

  async listComponents(siteId: bigint, pageType: string) {
    const instances = await this.prisma.siteComponentInstance.findMany({
      where:   { site_id: siteId, page_type: pageType },
      orderBy: { sort: 'asc' },
    })
    return instances.map(i => this.formatInst(i))
  }

  // ─── 私有：同步实例 → DSL ──────────────────────────────────────────────

  private async syncDsl(siteId: bigint, pageType: string, operatorId?: bigint) {
    const instances = await this.prisma.siteComponentInstance.findMany({
      where: { site_id: siteId, page_type: pageType }, orderBy: { sort: 'asc' },
    })
    const existing = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: pageType, is_active: true },
    })
    const meta = (existing?.dsl as any) ?? {}
    const gen  = this.layoutEngine.generate(meta.layout_code ?? 'layout_a')
    const dsl  = this.buildDsl(siteId.toString(), pageType, instances, gen, meta)

    if (existing) {
      await this.prisma.pageLayoutDsl.update({ where: { id: existing.id }, data: { dsl: dsl as any, version: { increment: 1 }, updated_at: new Date() } })
    } else {
      await this.prisma.pageLayoutDsl.create({ data: { site_id: siteId, page_type: pageType, dsl: dsl as any, version: 1, is_active: true, created_by: operatorId ?? null, created_at: new Date(), updated_at: new Date() } })
    }
  }

  // ─── 私有：构建 DSL 文档 ──────────────────────────────────────────────

  private buildDsl(siteId: string, pageType: string, instances: any[], gen: any, meta?: any): PageDslDoc {
    return {
      version:     (meta?.version ?? 0) + 1,
      site_id:     siteId,
      page_type:   pageType,
      layout_code: meta?.layout_code ?? gen?.code ?? 'layout_a',
      layout_name: meta?.layout_name ?? gen?.name ?? '标准均衡布局',
      lazy:        { enabled: true, initial: meta?.lazy?.initial ?? gen?.lazy_initial ?? 10, batch: meta?.lazy?.batch ?? gen?.lazy_batch ?? 5 },
      ad_config:   { count: instances.filter(i => i.component_type === 'image_ad').length, interval: meta?.ad_config?.interval ?? 5 },
      cat_config:  { count: instances.filter(i => i.component_type === 'category_entry').length, positions: meta?.cat_config?.positions ?? [9, 24, 39] },
      components:  instances.map(i => ({
        id:             i.id.toString(),
        component_type: i.component_type,
        sort:           i.sort,
        visible:        i.visible,
        template:       i.template ?? 'default',
        config:         (i.config_json as any) ?? {},
        play_index:     i.play_index,
        ad_index:       i.ad_index,
        cat_index:      i.cat_index,
        is_fixed:       i.is_fixed,
      })),
      exported_at: new Date().toISOString(),
    }
  }

  private async getNextSort(siteId: bigint, pageType: string): Promise<number> {
    const last = await this.prisma.siteComponentInstance.findFirst({
      where: { site_id: siteId, page_type: pageType }, orderBy: { sort: 'desc' },
    })
    return (last?.sort ?? -1) + 1
  }

  private formatInst(i: any) {
    return {
      id:             i.id.toString(),
      component_type: i.component_type,
      sort:           i.sort,
      visible:        i.visible,
      template:       i.template,
      config:         i.config_json,
      play_index:     i.play_index,
      ad_index:       i.ad_index,
      cat_index:      i.cat_index,
      is_fixed:       i.is_fixed,
    }
  }

  private ensureValidPageType(pageType: string) {
    const valid = ['home', 'results', 'play_detail', 'statistics', 'category']
    if (!valid.includes(pageType)) throw new BadRequestException(`无效的页面类型: ${pageType}`)
  }
}
