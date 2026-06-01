import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { SettlementService } from './settlement.service'
import { SettlementEngine } from '../../engines/settlement/settlement.engine'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { AttributeEngine } from '../../engines/attribute/attribute.engine'
import { PlayEngine } from '../../engines/play/play.engine'
import { PrismaService } from '../../prisma/prisma.service'

// ─── Mock factories ───────────────────────────────────────────────────────────

const mockResult = {
  id: 1n, lottery_type: 'hk', period: '2026001',
}
const mockResultNumbers = [
  { seq_no: 1, number_value: 1 },
  { seq_no: 2, number_value: 2 },
  { seq_no: 3, number_value: 3 },
  { seq_no: 4, number_value: 4 },
  { seq_no: 5, number_value: 5 },
  { seq_no: 6, number_value: 6 },
  { seq_no: 7, number_value: 7 },
]
const mockPlay    = { id: 10n, site_id: 1n, lottery_type: 'hk', rule_code: 'R001', status: 'active', name: '平特一肖' }
const mockRule    = { id: 1n, rule_code: 'R001', dsl: '{"predict_type":"zodiac","hit_mode":"include","target_scope":"special"}' }
const mockPred    = { id: 100n, play_id: 10n, period: '2026001', status: 'active', site_id: 1n, prediction_content: '鼠' }
const mockSr      = { hit: true, status: 'HIT', miss_streak: 0, hit_streak: 1, period: '2026001', prediction: ['鼠'] }
const mockSummary = { total_count: 10, hit_count: 7, miss_count: 3, hit_rate: 70, current_hit_streak: 2, current_miss_streak: 0, best_hit_streak: 5, best_miss_streak: 2, hidden_count: 0, updating_count: 0, last_10: { period_type: 'last_10', total: 10, hit_count: 7, miss_count: 3, hit_rate: 70 }, last_30: { period_type: 'last_30', total: 10, hit_count: 7, miss_count: 3, hit_rate: 70 }, last_100: { period_type: 'last_100', total: 10, hit_count: 7, miss_count: 3, hit_rate: 70 } }

function buildPrisma(overrides: Record<string, any> = {}) {
  return {
    result:              { findFirst: jest.fn().mockResolvedValue(mockResult), findMany: jest.fn().mockResolvedValue([mockResult]) },
    resultNumber:        { findMany: jest.fn().mockResolvedValue(mockResultNumbers) },
    attributeLibrary:    { findMany: jest.fn().mockResolvedValue([]) },
    play:                { findMany: jest.fn().mockResolvedValue([mockPlay]), findUnique: jest.fn().mockResolvedValue(mockPlay) },
    playRule:            { findFirst: jest.fn().mockResolvedValue(mockRule) },
    predictionRecord:    { findFirst: jest.fn().mockResolvedValue(mockPred), findMany: jest.fn().mockResolvedValue([mockPred]) },
    settlementRecord:    { deleteMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 1n }), findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([{ period: '2026001', hit: true, status: 'HIT', site_id: 1n }]), groupBy: jest.fn().mockResolvedValue([]) },
    statisticsSummary:   { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn().mockResolvedValue({}), create: jest.fn().mockResolvedValue({}) },
    statisticsPeriod:    { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn().mockResolvedValue({}), create: jest.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

function buildAttrEngine() {
  return {
    buildYearMaps: jest.fn().mockReturnValue({ zodiacMap: new Map(), elementMap: new Map() }),
    computeAll:    jest.fn().mockReturnValue(Array(7).fill({ number: 1, wave: '红波', size: '小', odd_even: '单', sum_odd_even: '合单', sum_size: '合小', tail_size: '小尾', head: '0头', tail: '1尾', sum_tail: '1合尾', left_right: '左边', inner_outer: '内围', seven_section: '第一行', five_section: '第一段', half_wave: '红单', zodiac: '鼠' })),
    getAttrByPredictType: jest.fn().mockReturnValue('鼠'),
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('SettlementService', () => {
  let service: SettlementService
  let prisma: any
  let settlementEngine: any
  let statisticsEngine: any
  let attributeEngine: any
  let playEngine: any

  beforeEach(async () => {
    prisma           = buildPrisma()
    attributeEngine  = buildAttrEngine()
    playEngine       = { parseDsl: jest.fn().mockReturnValue({ predict_type: 'zodiac', hit_mode: 'include', target_scope: 'special' }) }
    settlementEngine = { settle: jest.fn().mockReturnValue(mockSr), settleBatch: jest.fn().mockReturnValue([mockSr]) }
    statisticsEngine = { calculate: jest.fn().mockReturnValue(mockSummary) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementService,
        { provide: PrismaService,      useValue: prisma },
        { provide: SettlementEngine,   useValue: settlementEngine },
        { provide: StatisticsEngine,   useValue: statisticsEngine },
        { provide: AttributeEngine,    useValue: attributeEngine },
        { provide: PlayEngine,         useValue: playEngine },
      ],
    }).compile()

    service = module.get(SettlementService)
  })

  // ── settlePeriod ─────────────────────────────────────────────────────────

  describe('settlePeriod', () => {
    it('결과 없으면 NotFoundException', async () => {
      prisma.result.findFirst.mockResolvedValue(null)
      await expect(service.settlePeriod({ lottery_type: 'hk', period: '9999001' }))
        .rejects.toThrow(NotFoundException)
    })

    it('정상 결산 후 settled 수 반환', async () => {
      const res = await service.settlePeriod({ lottery_type: 'hk', period: '2026001' })
      expect(res.settled).toBe(1)
      expect(res.period).toBe('2026001')
      expect(settlementEngine.settle).toHaveBeenCalledTimes(1)
      expect(statisticsEngine.calculate).toHaveBeenCalledTimes(1)
    })

    it('예측 없으면 settled=0', async () => {
      prisma.predictionRecord.findFirst.mockResolvedValue(null)
      const res = await service.settlePeriod({ lottery_type: 'hk', period: '2026001' })
      expect(res.settled).toBe(0)
      expect(settlementEngine.settle).not.toHaveBeenCalled()
    })

    it('결산 후 settlementRecord upsert 호출', async () => {
      await service.settlePeriod({ lottery_type: 'hk', period: '2026001' })
      expect(prisma.settlementRecord.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ period: '2026001' }) }),
      )
      expect(prisma.settlementRecord.create).toHaveBeenCalledTimes(1)
    })

    it('통계 upsert: StatisticsSummary 없으면 create', async () => {
      await service.settlePeriod({ lottery_type: 'hk', period: '2026001' })
      expect(prisma.statisticsSummary.create).toHaveBeenCalledTimes(1)
    })

    it('통계 upsert: StatisticsSummary 있으면 update', async () => {
      prisma.statisticsSummary.findFirst.mockResolvedValue({ id: 99n })
      await service.settlePeriod({ lottery_type: 'hk', period: '2026001' })
      expect(prisma.statisticsSummary.update).toHaveBeenCalledTimes(1)
    })
  })

  // ── settleBatch ──────────────────────────────────────────────────────────

  describe('settleBatch', () => {
    it('결과 없으면 periods_processed=0 반환', async () => {
      prisma.result.findMany.mockResolvedValue([])
      const res = await service.settleBatch({ lottery_type: 'hk', year: 2026 })
      expect(res.periods_processed).toBe(0)
    })

    it('N기 결과 있으면 각 기 settlePeriod 호출', async () => {
      prisma.result.findMany.mockResolvedValue([
        { lottery_type: 'hk', period: '2026001' },
        { lottery_type: 'hk', period: '2026002' },
      ])
      const spy = jest.spyOn(service, 'settlePeriod').mockResolvedValue({ settled: 2, period: '', lottery_type: 'hk', plays_checked: 1 })
      const res = await service.settleBatch({ lottery_type: 'hk', year: 2026 })
      expect(spy).toHaveBeenCalledTimes(2)
      expect(res.total_settled).toBe(4)
    })
  })

  // ── settleYear ───────────────────────────────────────────────────────────

  describe('settleYear', () => {
    it('결과 없으면 total_settled=0', async () => {
      prisma.result.findMany.mockResolvedValue([])
      const res = await service.settleYear({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(res.total_settled).toBe(0)
    })

    it('플레이별 settleBatch 호출 후 통계 갱신', async () => {
      prisma.result.findMany.mockResolvedValue([{ lottery_type: 'hk', period: '2026001' }])
      prisma.predictionRecord.findMany.mockResolvedValue([mockPred])
      const refreshSpy = jest.spyOn(service, 'refreshStatistics').mockResolvedValue(undefined)

      await service.settleYear({ site_id: 1, lottery_type: 'hk', year: 2026 })

      expect(settlementEngine.settleBatch).toHaveBeenCalledTimes(1)
      expect(refreshSpy).toHaveBeenCalledTimes(1)
    })

    it('플레이가 없으면 total_settled=0', async () => {
      prisma.play.findMany.mockResolvedValue([])
      const res = await service.settleYear({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(res.plays_processed).toBe(0)
    })
  })

  // ── refreshStatistics ────────────────────────────────────────────────────

  describe('refreshStatistics', () => {
    it('결산 기록 없으면 통계 저장 안함 (empty override)', async () => {
      // override to empty
      prisma.settlementRecord = { ...prisma.settlementRecord, findMany: jest.fn().mockResolvedValue([]) }
      await service.refreshStatistics(10n, 'hk', 1n)
      expect(statisticsEngine.calculate).not.toHaveBeenCalled()
    })

    it('결산 기록 있으면 calculate + upsert', async () => {
      // default mock already returns one record
      await service.refreshStatistics(10n, 'hk', 1n)
      expect(statisticsEngine.calculate).toHaveBeenCalledTimes(1)
      expect(prisma.statisticsSummary.create).toHaveBeenCalledTimes(1)
    })
  })
})
