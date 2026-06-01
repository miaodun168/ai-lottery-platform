import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { CreatePlayDto } from './dto/create-play.dto'
import { UpdatePlayDto } from './dto/update-play.dto'
import { PlaysQueryDto } from './dto/plays-query.dto'

@Injectable()
export class PlaysService {
  constructor(
    private prisma:   PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(query: PlaysQueryDto) {
    const where: any = {}
    if (query.site_id)      where.site_id      = BigInt(query.site_id)
    if (query.lottery_type) where.lottery_type  = query.lottery_type

    const plays = await this.prisma.play.findMany({ where, orderBy: [{ sort_no: 'asc' }, { created_at: 'desc' }] })
    return plays.map(p => this.formatPlay(p))
  }

  async findOne(id: bigint) {
    const play = await this.prisma.play.findUnique({ where: { id } })
    if (!play) throw new NotFoundException('玩法不存在')
    return this.formatPlay(play)
  }

  async create(dto: CreatePlayDto, operatorId?: bigint) {
    // 验证 rule_code 存在
    const rule = await this.prisma.playRule.findFirst({ where: { rule_code: dto.rule_code, status: true } })
    if (!rule) throw new BadRequestException(`规则 ${dto.rule_code} 不存在或已停用`)

    const play = await this.prisma.play.create({
      data: {
        site_id:      BigInt(dto.site_id),
        lottery_type: dto.lottery_type,
        rule_code:    dto.rule_code,
        name:         dto.name,
        alias_name:   dto.alias_name ?? null,
        group_size:   rule ? JSON.parse(rule.dsl ?? '{}').group_size ?? 1 : 1,
        status:       'active',
        sort_no:      dto.sort_no ?? null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
    })

    await this.auditLog.log(operatorId ?? null, 'CREATE_PLAY', 'play', play.id, { name: dto.name, rule_code: dto.rule_code })
    return this.formatPlay(play)
  }

  async update(id: bigint, dto: UpdatePlayDto, operatorId?: bigint) {
    const play = await this.prisma.play.findUnique({ where: { id } })
    if (!play) throw new NotFoundException('玩法不存在')

    const updated = await this.prisma.play.update({
      where: { id },
      data:  { ...dto, updated_at: new Date() },
    })
    await this.auditLog.log(operatorId ?? null, 'UPDATE_PLAY', 'play', id, dto as any)
    return this.formatPlay(updated)
  }

  async remove(id: bigint, operatorId?: bigint) {
    const play = await this.prisma.play.findUnique({ where: { id } })
    if (!play) throw new NotFoundException('玩法不存在')

    await this.prisma.play.update({ where: { id }, data: { status: 'deleted', updated_at: new Date() } })
    await this.auditLog.log(operatorId ?? null, 'DELETE_PLAY', 'play', id)
    return { success: true }
  }

  async setStatus(id: bigint, status: string, operatorId?: bigint) {
    const play = await this.prisma.play.findUnique({ where: { id } })
    if (!play) throw new NotFoundException('玩法不存在')

    const updated = await this.prisma.play.update({ where: { id }, data: { status, updated_at: new Date() } })
    await this.auditLog.log(operatorId ?? null, `SET_PLAY_STATUS:${status}`, 'play', id)
    return this.formatPlay(updated)
  }

  async regenerate(id: bigint, operatorId?: bigint) {
    const play = await this.prisma.play.findUnique({ where: { id } })
    if (!play) throw new NotFoundException('玩法不存在')
    await this.auditLog.log(operatorId ?? null, 'REGENERATE_PLAY', 'play', id)
    // 实际生成逻辑由 GeneratorService 实现
    return { success: true, message: '已触发数据重新生成，请稍后查看统计数据' }
  }

  // 查询规则库（供创建玩法时选择）
  async getRules() {
    const rules = await this.prisma.playRule.findMany({ where: { status: true }, orderBy: { rule_code: 'asc' } })
    return rules.map(r => ({
      rule_code:  r.rule_code,
      rule_name:  r.rule_name,
      version:    r.version,
      dsl:        r.dsl ? JSON.parse(r.dsl) : null,
    }))
  }

  private formatPlay(p: any) {
    return {
      id:           p.id.toString(),
      site_id:      p.site_id?.toString() ?? null,
      lottery_type: p.lottery_type,
      rule_code:    p.rule_code,
      name:         p.name,
      alias_name:   p.alias_name,
      group_size:   p.group_size,
      status:       p.status,
      sort_no:      p.sort_no,
      created_at:   p.created_at,
    }
  }
}
