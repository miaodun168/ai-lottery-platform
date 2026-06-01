import {
  Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditLogService } from '../../common/services/audit-log.service'
import { AttributeEngine } from '../../engines/attribute/attribute.engine'
import { PlayEngine } from '../../engines/play/play.engine'
import { ResultEngine, LotteryResult } from '../../engines/result/result.engine'
import { SettlementEngine } from '../../engines/settlement/settlement.engine'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { CreateResultDto } from './dto/create-result.dto'
import { UpdateResultDto } from './dto/update-result.dto'

@Injectable()
export class ResultsService {
  constructor(
    private prisma:            PrismaService,
    private auditLog:          AuditLogService,
    private attrEngine:        AttributeEngine,
    private playEngine:        PlayEngine,
    private resultEngine:      ResultEngine,
    private settlementEngine:  SettlementEngine,
    private statisticsEngine:  StatisticsEngine,
  ) {}

  // ─── 开奖录入（核心流程）────────────────────────────────────────────────────

  async create(dto: CreateResultDto, operatorId?: bigint) {
    // 1. 验证号码
    const validation = this.resultEngine.validate(dto.numbers)
    if (!validation.valid) throw new BadRequestException(validation.errors.join('; '))

    // 2. 检查期号是否重复
    const existing = await this.prisma.result.findFirst({
      where: { lottery_type: dto.lottery_type, period: dto.period },
    })
    if (existing) throw new ConflictException(`期号 ${dto.period} 已存在`)

    // 3. 加载年度生肖/五行映射
    const year = parseInt(dto.period.substring(0, 4))
    const { zodiacMap, elementMap } = await this.loadYearMaps(year)

    // 4. 计算所有属性快照
    const processed = this.resultEngine.process(dto.period, dto.numbers, zodiacMap, elementMap)

    // 5. 事务：保存开奖结果 + 号码 + 属性快照
    const savedResult = await this.prisma.$transaction(async (tx) => {
      const result = await tx.result.create({
        data: {
          lottery_type: dto.lottery_type,
          period:       dto.period,
          draw_date:    new Date(),
          input_type:   'manual',
          status:       'published',
          created_at:   new Date(),
        },
      })

      // 保存7个号码
      for (let i = 0; i < processed.numbers.length; i++) {
        const a = processed.attributes[i]
        await tx.resultNumber.create({
          data: {
            result_id:    result.id,
            seq_no:       i + 1,
            number_value: processed.numbers[i],
            zodiac:       a.zodiac    ?? null,
            wave_color:   a.wave,
            element:      a.element   ?? null,
            created_at:   new Date(),
          },
        })
      }

      // 保存属性快照（特码全量属性）
      const sa = processed.attributes[6]
      const snapshot = [
        { code: 'wave',         value: sa.wave },
        { code: 'size',         value: sa.size },
        { code: 'odd_even',     value: sa.odd_even },
        { code: 'sum_odd_even', value: sa.sum_odd_even },
        { code: 'sum_size',     value: sa.sum_size },
        { code: 'head',         value: sa.head },
        { code: 'tail',         value: sa.tail },
        { code: 'half_wave',    value: sa.half_wave },
        { code: 'left_right',   value: sa.left_right },
        { code: 'inner_outer',  value: sa.inner_outer },
        { code: 'zodiac',       value: sa.zodiac       ?? '' },
        { code: 'element',      value: sa.element      ?? '' },
        { code: 'yin_yang',     value: sa.yin_yang     ?? '' },
        { code: 'heaven_earth', value: sa.heaven_earth ?? '' },
        { code: 'domestic_wild',value: sa.domestic_wild?? '' },
        { code: 'civil_martial',value: sa.civil_martial?? '' },
      ].filter(x => x.value)

      for (const attr of snapshot) {
        await tx.resultAttribute.create({
          data: { result_id: result.id, attribute_code: attr.code, attribute_value: attr.value },
        })
      }

      return result
    })

    await this.auditLog.log(operatorId ?? null, 'CREATE_RESULT', 'result', savedResult.id, {
      lottery_type: dto.lottery_type, period: dto.period,
    })

    // 6. 触发结算（异步，不阻塞响应）
    this.runSettlement(dto.lottery_type, dto.period, processed)
      .catch(err => console.error('[ResultsService] Settlement error:', err))

    return this.formatResult(savedResult)
  }

  // ─── 开奖列表 ──────────────────────────────────────────────────────────────

  async findAll(query?: { lottery_type?: string; year?: string }) {
    const where: any = {}
    if (query?.lottery_type) where.lottery_type = query.lottery_type
    if (query?.year) {
      where.period = { startsWith: query.year }
    }

    const results = await this.prisma.result.findMany({
      where,
      orderBy: { period: 'desc' },
      take: 100,
    })
    return results.map(r => this.formatResult(r))
  }

  // ─── 开奖详情 ──────────────────────────────────────────────────────────────

  async findOne(id: bigint) {
    const result = await this.prisma.result.findUnique({ where: { id } })
    if (!result) throw new NotFoundException('开奖结果不存在')

    const numbers = await this.prisma.resultNumber.findMany({
      where: { result_id: id }, orderBy: { seq_no: 'asc' },
    })
    const attributes = await this.prisma.resultAttribute.findMany({ where: { result_id: id } })

    return {
      ...this.formatResult(result),
      numbers:    numbers.map(n => ({ seq_no: n.seq_no, number: n.number_value, zodiac: n.zodiac, wave: n.wave_color, element: n.element })),
      attributes: Object.fromEntries(attributes.map(a => [a.attribute_code, a.attribute_value])),
    }
  }

  // ─── 修改开奖（触发重算）──────────────────────────────────────────────────

  async update(id: bigint, dto: UpdateResultDto, operatorId?: bigint) {
    const result = await this.prisma.result.findUnique({ where: { id } })
    if (!result) throw new NotFoundException('开奖结果不存在')
    if (result.status === 'settled') throw new BadRequestException('已结算开奖需先执行回滚')

    if (dto.numbers) {
      const v = this.resultEngine.validate(dto.numbers)
      if (!v.valid) throw new BadRequestException(v.errors.join('; '))

      const year = parseInt(result.period.substring(0, 4))
      const { zodiacMap, elementMap } = await this.loadYearMaps(year)
      const processed = this.resultEngine.process(result.period, dto.numbers, zodiacMap, elementMap)

      // 删除旧快照，重新生成
      await this.prisma.$transaction(async (tx) => {
        await tx.resultNumber.deleteMany({ where: { result_id: id } })
        await tx.resultAttribute.deleteMany({ where: { result_id: id } })

        for (let i = 0; i < processed.numbers.length; i++) {
          const a = processed.attributes[i]
          await tx.resultNumber.create({
            data: { result_id: id, seq_no: i + 1, number_value: processed.numbers[i], zodiac: a.zodiac ?? null, wave_color: a.wave, element: a.element ?? null, created_at: new Date() },
          })
        }

        await tx.result.update({ where: { id }, data: { status: 'published' } })
      })

      await this.auditLog.log(operatorId ?? null, 'UPDATE_RESULT', 'result', id, { numbers: dto.numbers })

      // 重新触发结算
      const year2 = parseInt(result.period.substring(0, 4))
      const { zodiacMap: zm2, elementMap: em2 } = await this.loadYearMaps(year2)
      const processed2 = this.resultEngine.process(result.period, dto.numbers, zm2, em2)
      this.runSettlement(result.lottery_type, result.period, processed2)
        .catch(err => console.error('[ResultsService] Re-settlement error:', err))
    }

    return this.findOne(id)
  }

  // ─── 内部：结算流程 ────────────────────────────────────────────────────────

  private async runSettlement(lotteryType: string, period: string, processed: LotteryResult) {
    const plays = await this.prisma.play.findMany({
      where: { lottery_type: lotteryType, status: 'active' },
    })

    for (const play of plays) {
      try {
        const prediction = await this.prisma.predictionRecord.findFirst({
          where: { play_id: play.id, period, status: 'active' },
        })
        if (!prediction) continue

        const rule = await this.prisma.playRule.findFirst({ where: { rule_code: play.rule_code ?? '' } })
        if (!rule?.dsl) continue

        const dsl         = this.playEngine.parseDsl(rule.dsl)
        const predictions = prediction.prediction_content.split(',').map(s => s.trim())
        const sr          = this.settlementEngine.settle(period, predictions, processed, dsl, 0, 0)

        // 删除旧结算（如有）
        await this.prisma.settlementRecord.deleteMany({ where: { play_id: play.id, period } })

        await this.prisma.settlementRecord.create({
          data: {
            site_id:       play.site_id,
            lottery_type:  lotteryType,
            play_id:       play.id,
            period,
            prediction_id: prediction.id,
            hit:           sr.hit,
            status:        sr.status,
            created_at:    new Date(),
          },
        })

        await this.refreshStatistics(play.id, lotteryType, play.site_id)
      } catch (e) {
        console.error(`[Settlement] play=${play.id} period=${period}`, e)
      }
    }
  }

  // ─── 内部：刷新统计汇总 ──────────────────────────────────────────────────

  private async refreshStatistics(playId: bigint, lotteryType: string, siteId: bigint | null) {
    const year = new Date().getFullYear()

    const allSr = await this.prisma.settlementRecord.findMany({
      where:   { play_id: playId, lottery_type: lotteryType },
      orderBy: { period: 'asc' },
    })

    const records = allSr.map(s => ({
      period: s.period, prediction: [], hit: s.hit ?? false,
      status: (s.status ?? 'MISS') as any, miss_streak: 0, hit_streak: 0,
    }))

    const summary  = this.statisticsEngine.calculate(records)

    const existing = await this.prisma.statisticsSummary.findFirst({
      where: { play_id: playId, lottery_type: lotteryType },
    })

    const data = {
      site_id:             siteId,
      lottery_type:        lotteryType,
      play_id:             playId,
      year,
      total_count:         summary.total_count,
      hit_count:           summary.hit_count,
      miss_count:          summary.miss_count,
      hit_rate:            summary.hit_rate,
      current_hit_streak:  summary.current_hit_streak,
      current_miss_streak: summary.current_miss_streak,
      best_hit_streak:     summary.best_hit_streak,
      best_miss_streak:    summary.best_miss_streak,
      hidden_count:        summary.hidden_count,
      updating_count:      summary.updating_count,
      updated_at:          new Date(),
    }

    if (existing) {
      await this.prisma.statisticsSummary.update({ where: { id: existing.id }, data })
    } else {
      await this.prisma.statisticsSummary.create({ data })
    }

    // 更新近期统计
    for (const [pType, stats] of Object.entries({
      last_10:  summary.last_10,
      last_30:  summary.last_30,
      last_100: summary.last_100,
    })) {
      const existingP = await this.prisma.statisticsPeriod.findFirst({
        where: { play_id: playId, lottery_type: lotteryType, period_type: pType },
      })
      const pData = {
        site_id: siteId, lottery_type: lotteryType, play_id: playId,
        period_type: pType, hit_count: stats.hit_count, miss_count: stats.miss_count,
        hit_rate: stats.hit_rate, updated_at: new Date(),
      }
      if (existingP) {
        await this.prisma.statisticsPeriod.update({ where: { id: existingP.id }, data: pData })
      } else {
        await this.prisma.statisticsPeriod.create({ data: pData })
      }
    }
  }

  // ─── 内部：加载年度映射 ───────────────────────────────────────────────────

  private async loadYearMaps(year: number) {
    const entries = await this.prisma.attributeLibrary.findMany({
      where: { year, attribute_type: { in: ['zodiac_number', 'element'] } },
    })
    return this.attrEngine.buildYearMaps(entries.map(e => ({
      attribute_type:  e.attribute_type  ?? '',
      attribute_name:  e.attribute_name  ?? '',
      attribute_value: e.attribute_value ?? '[]',
      year:            e.year            ?? year,
    })))
  }

  private formatResult(r: any) {
    return {
      id:           r.id.toString(),
      lottery_type: r.lottery_type,
      period:       r.period,
      draw_date:    r.draw_date,
      status:       r.status,
      input_type:   r.input_type,
      created_at:   r.created_at,
    }
  }
}
