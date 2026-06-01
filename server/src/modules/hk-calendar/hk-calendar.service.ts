import {
  Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { UpdateCalendarDto } from './dto/update-calendar.dto'
import { ImportCalendarDto } from './dto/import-calendar.dto'

interface CalendarRow {
  period_no: string
  draw_date:  string
  draw_time:  string
}

@Injectable()
export class HkCalendarService {
  constructor(
    private prisma:   PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // ─── 导入日历（CSV 文件）──────────────────────────────────────────────────

  async import(file: Express.Multer.File, dto: ImportCalendarDto, operatorId?: bigint) {
    if (!file) throw new BadRequestException('请上传文件')

    const rows = this.parseCsv(file.buffer.toString('utf8'))
    const errors: string[] = []
    const valid: CalendarRow[] = []

    // 校验每行
    for (const row of rows) {
      if (!row.period_no) { errors.push(`缺少期号: ${JSON.stringify(row)}`); continue }
      if (!row.draw_date)  { errors.push(`缺少开奖日期: ${row.period_no}`); continue }
      if (!row.draw_time)  { errors.push(`缺少开奖时间: ${row.period_no}`); continue }

      const yearFromPeriod = row.period_no.substring(0, 4)
      const yearFromDate   = row.draw_date.substring(0, 4)
      if (yearFromPeriod !== yearFromDate) {
        errors.push(`年份不一致: period_no=${row.period_no} draw_date=${row.draw_date}`)
        continue
      }
      valid.push(row)
    }
    if (errors.length > 0) throw new BadRequestException(`校验失败: ${errors.join('; ')}`)

    const year = parseInt(valid[0].period_no.substring(0, 4))

    // replace 模式：删除未开奖记录
    if (dto.mode === 'replace') {
      await this.prisma.hkCalendar.deleteMany({
        where: { year, status: { in: ['pending', 'drawing'] } },
      })
    }

    // 批量插入
    let inserted = 0
    const duplicate: string[] = []
    for (const row of valid) {
      const exists = await this.prisma.hkCalendar.findFirst({
        where: { year, period_no: row.period_no },
      })
      if (exists) { duplicate.push(row.period_no); continue }

      await this.prisma.hkCalendar.create({
        data: {
          year,
          period_no: row.period_no,
          draw_date:  new Date(row.draw_date),
          draw_time:  new Date(row.draw_time),
          status:    'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
      inserted++
    }

    await this.auditLog.log(operatorId ?? null, 'IMPORT_HK_CALENDAR', 'hk_calendar', null, { year, inserted, mode: dto.mode })
    return { year, inserted, skipped: duplicate.length, duplicates: duplicate }
  }

  // ─── 日历列表 ──────────────────────────────────────────────────────────────

  async findAll(year?: number) {
    const where: any = {}
    if (year) where.year = year

    const list = await this.prisma.hkCalendar.findMany({
      where,
      orderBy: { period_no: 'asc' },
    })
    return list.map(c => ({
      id:        c.id.toString(),
      year:      c.year,
      period_no: c.period_no,
      draw_date: c.draw_date,
      draw_time: c.draw_time,
      status:    c.status,
    }))
  }

  // ─── 修改期号 ──────────────────────────────────────────────────────────────

  async update(id: bigint, dto: UpdateCalendarDto, operatorId?: bigint) {
    const entry = await this.prisma.hkCalendar.findUnique({ where: { id } })
    if (!entry) throw new NotFoundException('期号不存在')
    if (entry.status === 'completed') throw new BadRequestException('已开奖期号不能修改')

    const updated = await this.prisma.hkCalendar.update({
      where: { id },
      data:  {
        draw_date:  dto.draw_date  ? new Date(dto.draw_date)  : undefined,
        draw_time:  dto.draw_time  ? new Date(dto.draw_time)  : undefined,
        status:     dto.status,
        updated_at: new Date(),
      },
    })
    await this.auditLog.log(operatorId ?? null, 'UPDATE_HK_CALENDAR', 'hk_calendar', id, dto as any)
    return { id: updated.id.toString(), period_no: updated.period_no, status: updated.status }
  }

  // ─── 删除期号（仅 pending） ────────────────────────────────────────────────

  async remove(id: bigint, operatorId?: bigint) {
    const entry = await this.prisma.hkCalendar.findUnique({ where: { id } })
    if (!entry) throw new NotFoundException('期号不存在')
    if (entry.status !== 'pending') throw new BadRequestException('只能删除待开奖期号')

    await this.prisma.hkCalendar.delete({ where: { id } })
    await this.auditLog.log(operatorId ?? null, 'DELETE_HK_CALENDAR', 'hk_calendar', id)
    return { success: true }
  }

  // ─── 简单 CSV 解析 ────────────────────────────────────────────────────────

  private parseCsv(text: string): CalendarRow[] {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []

    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows: CalendarRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < 3) continue
      const row: any = {}
      header.forEach((h, idx) => { row[h] = cols[idx] })
      rows.push(row as CalendarRow)
    }
    return rows
  }
}
