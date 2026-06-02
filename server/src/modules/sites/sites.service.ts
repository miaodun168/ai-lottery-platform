import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { CreateSiteDto } from './dto/create-site.dto'
import { ApplyThemeDto } from './dto/apply-theme.dto'
import { ApplyLayoutDto } from './dto/apply-layout.dto'

@Injectable()
export class SitesService {
  constructor(
    private prisma:    PrismaService,
    private auditLog:  AuditLogService,
  ) {}

  async create(dto: CreateSiteDto, operatorId?: bigint) {
    const theme  = dto.theme  ? await this.prisma.theme.findFirst({ where: { theme_code: dto.theme } })  : null
    const layout = dto.layout ? await this.prisma.layout.findFirst({ where: { layout_code: dto.layout } }) : null
    const code   = await this.generateUniqueCode(dto.name, dto.lottery_types)

    const site = await this.prisma.site.create({
      data: {
        name:        dto.name,
        code,
        status:      'draft',
        theme_id:    theme?.id  ?? null,
        layout_id:   layout?.id ?? null,
        created_at:  new Date(),
        updated_at:  new Date(),
      },
    })

    await this.auditLog.log(operatorId ?? null, 'CREATE_SITE', 'site', site.id, { name: dto.name, code })
    return this.formatSite(site)
  }

  // 按名称复制站点（复制 theme_id/layout_id，生成新 code，状态置 draft）
  async clone(sourceName: string, operatorId?: bigint) {
    const src = await this.prisma.site.findFirst({
      where:   { name: sourceName, status: { not: 'deleted' } },
      orderBy: { created_at: 'desc' },
    })
    if (!src) return null

    const name = `${src.name}_副本_${Date.now()}`
    const code = await this.generateUniqueCode(name)
    const site = await this.prisma.site.create({
      data: {
        name,
        code,
        status:     'draft',
        theme_id:   src.theme_id,
        layout_id:  src.layout_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    await this.auditLog.log(operatorId ?? null, 'CLONE_SITE', 'site', site.id, { source: src.id.toString(), code })
    return this.formatSite(site)
  }

  // 为 code 为 NULL 的历史站点补填（可供管理接口调用）
  async backfillCodes() {
    const sites = await this.prisma.site.findMany({ where: { code: null } })
    for (const s of sites) {
      const code = await this.generateUniqueCode(s.name)
      await this.prisma.site.update({ where: { id: s.id }, data: { code } })
    }
    return { patched: sites.length }
  }

  private async generateUniqueCode(name: string, lotteryTypes?: string[]): Promise<string> {
    // ASCII slug（截取名称中的英数字符）
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)

    // 无 ASCII 字符时用采种前缀（hk / mo / hkmo）或通用 site
    const ltPrefix = lotteryTypes?.map(t => t === 'macau' ? 'mo' : t).join('') ?? ''
    const prefix   = slug || ltPrefix || 'site'

    for (let i = 0; i < 8; i++) {
      // 4 位 base36 随机后缀（约 1.68M 空间，碰撞概率极低）
      const suffix = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0')
      const code   = `${prefix}_${suffix}`
      const exists = await this.prisma.site.findFirst({ where: { code } })
      if (!exists) return code
    }

    // 兜底：使用毫秒时间戳（理论上不可能走到这里）
    return `${prefix}_${Date.now().toString(36)}`
  }

  async findAll() {
    const sites = await this.prisma.site.findMany({ orderBy: { created_at: 'desc' } })
    return sites.map(s => this.formatSite(s))
  }

  async findOne(id: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')
    return this.formatSite(site)
  }

  async update(id: bigint, dto: Partial<CreateSiteDto>, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')

    const updated = await this.prisma.site.update({
      where: { id },
      data:  { ...dto, updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'UPDATE_SITE', 'site', id, dto as any)
    return this.formatSite(updated)
  }

  async remove(id: bigint, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')
    if (site.status === 'published') throw new BadRequestException('已发布站点不能直接删除，请先下线')

    await this.prisma.site.update({ where: { id }, data: { status: 'deleted' } })
    await this.auditLog.log(operatorId ?? null, 'DELETE_SITE', 'site', id)
    return { success: true }
  }

  async publish(id: bigint, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')

    const updated = await this.prisma.site.update({
      where: { id },
      data:  { status: 'published', updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'PUBLISH_SITE', 'site', id)
    return this.formatSite(updated)
  }

  async suspend(id: bigint, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')

    const updated = await this.prisma.site.update({
      where: { id },
      data:  { status: 'disabled', updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'SUSPEND_SITE', 'site', id)
    return this.formatSite(updated)
  }

  async applyTheme(id: bigint, dto: ApplyThemeDto, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')

    const updated = await this.prisma.site.update({
      where: { id },
      data:  { theme_id: BigInt(dto.theme_id), updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'APPLY_THEME', 'site', id, { theme_id: dto.theme_id })
    return this.formatSite(updated)
  }

  async applyLayout(id: bigint, dto: ApplyLayoutDto, operatorId?: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id } })
    if (!site) throw new NotFoundException('站点不存在')

    const updated = await this.prisma.site.update({
      where: { id },
      data:  { layout_id: BigInt(dto.layout_id), updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'APPLY_LAYOUT', 'site', id, { layout_id: dto.layout_id })
    return this.formatSite(updated)
  }

  async getDashboardStats() {
    const [siteCount, playCount, resultCount] = await Promise.all([
      this.prisma.site.count(),
      this.prisma.play.count(),
      this.prisma.result.count(),
    ])
    return { sites: siteCount, plays: playCount, results: resultCount }
  }

  private formatSite(s: any) {
    return {
      id:         s.id.toString(),
      name:       s.name,
      code:       s.code,
      domain:     s.domain,
      theme_id:   s.theme_id?.toString() ?? null,
      layout_id:  s.layout_id?.toString() ?? null,
      status:     s.status,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }
  }
}
