import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  LayoutSlot, LayoutConfig, ComponentType,
  LAYOUT_LIBRARY, COMPONENT_DEFINITIONS,
} from './layout.constants'

export interface GeneratedLayout {
  code:         string
  name:         string
  lazy_initial: number
  lazy_batch:   number
  slots:        LayoutSlot[]
}

@Injectable()
export class LayoutEngine {
  constructor(private prisma: PrismaService) {}

  // 主入口：优先 DB，不存在则 fallback 内存常量
  async resolve(siteId: bigint, pageType: string, options?: { play_count?: number; ad_count?: number; cat_count?: number }): Promise<GeneratedLayout> {
    const db = await this.resolveFromDb(siteId, pageType)
    if (db) return db
    return this.generate('layout_a', options)
  }

  // 从 DB 读取实例表重建 layout
  async resolveFromDb(siteId: bigint, pageType: string): Promise<GeneratedLayout | null> {
    const dslRecord = await this.prisma.pageLayoutDsl.findFirst({
      where: { site_id: siteId, page_type: pageType, is_active: true },
    })
    if (!dslRecord) return null

    const instances = await this.prisma.siteComponentInstance.findMany({
      where: { site_id: siteId, page_type: pageType },
      orderBy: { sort: 'asc' },
    })
    if (instances.length === 0) return null

    const meta = dslRecord.dsl as any
    const lazyInit = meta?.lazy?.initial ?? 10

    const slots: LayoutSlot[] = instances.map((inst, i) => {
      const def = COMPONENT_DEFINITIONS[inst.component_type]
      return {
        type:       inst.component_type as ComponentType,
        level:      (def?.level ?? 'L2') as any,
        fixed:      inst.is_fixed,
        visible:    inst.visible,
        sort:       inst.sort,
        template:   inst.template ?? 'default',
        play_index: inst.play_index  ?? undefined,
        ad_index:   inst.ad_index    ?? undefined,
        cat_index:  inst.cat_index   ?? undefined,
        lazy:       i >= lazyInit,
        mobile:     true,
        desktop:    true,
        data_key:   inst.play_index != null ? `play_${inst.play_index}`
                  : inst.ad_index  != null ? `ad_${inst.ad_index}`
                  : inst.cat_index != null ? `cat_${inst.cat_index}`
                  : undefined,
      }
    })

    return {
      code:         meta?.layout_code ?? 'custom',
      name:         meta?.layout_name ?? '自定义布局',
      lazy_initial: lazyInit,
      lazy_batch:   meta?.lazy?.batch ?? 5,
      slots,
    }
  }

  // 内存生成（首次初始化用）
  generate(layoutCode: string, options?: { play_count?: number; ad_count?: number; cat_count?: number }): GeneratedLayout {
    const base = LAYOUT_LIBRARY[layoutCode] ?? LAYOUT_LIBRARY['layout_a']
    const config: LayoutConfig = {
      ...base,
      play_count: options?.play_count ?? base.play_count,
      ad_count:   options?.ad_count   ?? base.ad_count,
      cat_count:  options?.cat_count  ?? base.cat_count,
    }

    const slots: LayoutSlot[] = []
    let sort = 0

    const push = (type: ComponentType, extra?: Partial<LayoutSlot>) => {
      const def = COMPONENT_DEFINITIONS[type]
      slots.push({ type, sort: sort++, visible: true, mobile: true, desktop: true, template: 'default',
        level: (def?.level ?? 'L2') as any, fixed: def?.fixed ?? false, lazy: sort > config.lazy_initial, ...extra })
    }

    push('logo',           { fixed: true, lazy: false })
    push('result_board',   { fixed: true, lazy: false })
    if (layoutCode !== 'layout_b' && layoutCode !== 'layout_e') push('banner_slider', { lazy: false })
    push('lottery_switch', { fixed: true, lazy: false })

    const catSet = new Set(config.cat_positions)
    let playIdx = 0, adIdx = 0, catIdx = 0, contentSlot = 0

    while (playIdx < config.play_count) {
      if (catSet.has(contentSlot) && catIdx < config.cat_count) { push('category_entry', { cat_index: catIdx++ }); contentSlot++; continue }
      if (config.ad_interval > 0 && playIdx > 0 && playIdx % config.ad_interval === 0 && adIdx < config.ad_count) { push('image_ad', { ad_index: adIdx++ }); contentSlot++; continue }
      push('play_card', { play_index: playIdx++ }); contentSlot++
    }
    while (adIdx  < config.ad_count)  push('image_ad',       { ad_index:  adIdx++ })
    while (catIdx < config.cat_count) push('category_entry', { cat_index: catIdx++ })
    push('bottom_nav', { fixed: true, lazy: false })

    return { code: config.code, name: config.name, lazy_initial: config.lazy_initial, lazy_batch: config.lazy_batch, slots }
  }

  listAll() {
    return Object.values(LAYOUT_LIBRARY).map(l => ({ code: l.code, name: l.name, description: l.description, default_plays: l.play_count, default_ads: l.ad_count, default_cats: l.cat_count }))
  }

  async syncToDb() {
    for (const l of Object.values(LAYOUT_LIBRARY)) {
      const exists = await this.prisma.layout.findFirst({ where: { layout_code: l.code } })
      if (!exists) await this.prisma.layout.create({ data: { layout_code: l.code, layout_name: l.name, config_json: l as any, created_at: new Date() } })
    }
  }

  async loadFromDb(layoutId: bigint) {
    const row = await this.prisma.layout.findUnique({ where: { id: layoutId } })
    if (!row) return null
    const code = (row.config_json as any)?.code ?? row.layout_code
    return LAYOUT_LIBRARY[code ?? 'layout_a'] ?? LAYOUT_LIBRARY['layout_a']
  }
}
