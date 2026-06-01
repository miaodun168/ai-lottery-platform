import { Test, TestingModule } from '@nestjs/testing'
import { StatisticsService } from './statistics.service'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { PrismaService } from '../../prisma/prisma.service'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSummaryCalc = {
  total_count: 20, hit_count: 14, miss_count: 6, hit_rate: 70,
  current_hit_streak: 3, current_miss_streak: 0, best_hit_streak: 8, best_miss_streak: 4,
  hidden_count: 0, updating_count: 0,
  last_10:  { period_type: 'last_10',  total: 10, hit_count: 8, miss_count: 2, hit_rate: 80 },
  last_30:  { period_type: 'last_30',  total: 20, hit_count: 14, miss_count: 6, hit_rate: 70 },
  last_100: { period_type: 'last_100', total: 20, hit_count: 14, miss_count: 6, hit_rate: 70 },
}

const mockSettlementRows = [
  { period: '2026001', hit: true,  status: 'HIT',  site_id: 1n, play_id: 10n },
  { period: '2026002', hit: false, status: 'MISS', site_id: 1n, play_id: 10n },
]

function buildPrisma(overrides: Record<string, any> = {}) {
  return {
    settlementRecord:  { groupBy: jest.fn().mockResolvedValue([]), findMany: jest.fn().mockResolvedValue(mockSettlementRows) },
    statisticsSummary: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
    statisticsPeriod:  { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
    // getStatistics / getRanking helpers
    statisticsSummary2: undefined,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StatisticsService', () => {
  let service: StatisticsService
  let prisma: any
  let statsEngine: any

  beforeEach(async () => {
    prisma      = buildPrisma()
    statsEngine = { calculate: jest.fn().mockReturnValue(mockSummaryCalc) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: PrismaService,    useValue: prisma },
        { provide: StatisticsEngine, useValue: statsEngine },
      ],
    }).compile()

    service = module.get(StatisticsService)
  })

  // ── rebuildAll ───────────────────────────────────────────────────────────

  describe('rebuildAll', () => {
    it('결산 기록 없으면 processed=0', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([])
      const res = await service.rebuildAll()
      expect(res.processed).toBe(0)
    })

    it('그룹별 calculate + upsert 호출', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([
        { play_id: 10n, lottery_type: 'hk' },
        { play_id: 20n, lottery_type: 'hk' },
      ])
      const res = await service.rebuildAll()
      expect(statsEngine.calculate).toHaveBeenCalledTimes(2)
      expect(res.processed).toBe(2)
      expect(res.total_groups).toBe(2)
    })

    it('play_id가 null인 그룹은 건너뜀', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([
        { play_id: null, lottery_type: 'hk' },
      ])
      const res = await service.rebuildAll()
      expect(statsEngine.calculate).not.toHaveBeenCalled()
      expect(res.processed).toBe(0)
    })

    it('lottery_type 필터 적용', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([
        { play_id: 10n, lottery_type: 'mo' },
      ])
      await service.rebuildAll('mo')
      expect(prisma.settlementRecord.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { lottery_type: 'mo' } }),
      )
    })

    it('StatisticsSummary 없으면 create', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([{ play_id: 10n, lottery_type: 'hk' }])
      await service.rebuildAll()
      expect(prisma.statisticsSummary.create).toHaveBeenCalledTimes(1)
    })

    it('StatisticsSummary 있으면 update', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([{ play_id: 10n, lottery_type: 'hk' }])
      prisma.statisticsSummary.findFirst.mockResolvedValue({ id: 5n })
      await service.rebuildAll()
      expect(prisma.statisticsSummary.update).toHaveBeenCalledTimes(1)
    })

    it('StatisticsPeriod 3개 upsert (last_10/30/100)', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([{ play_id: 10n, lottery_type: 'hk' }])
      await service.rebuildAll()
      expect(prisma.statisticsPeriod.create).toHaveBeenCalledTimes(3)
    })

    it('반환 메시지에 처리 수 포함', async () => {
      prisma.settlementRecord.groupBy.mockResolvedValue([{ play_id: 10n, lottery_type: 'hk' }])
      const res = await service.rebuildAll()
      expect(res.message).toContain('1/1')
    })
  })

  // ── getStatistics (기존 기능 회귀) ─────────────────────────────────────

  describe('getStatistics (regression)', () => {
    it('통계 없으면 null 반환', async () => {
      prisma.statisticsSummary = { findFirst: jest.fn().mockResolvedValue(null) }
      const res = await service.getStatistics({ play_id: '999', lottery_type: 'hk' })
      expect(res).toBeNull()
    })
  })

  // ── getRanking (기존 기능 회귀) ────────────────────────────────────────

  describe('getRanking (regression)', () => {
    it('빈 랭킹 반환', async () => {
      prisma.statisticsSummary = { findMany: jest.fn().mockResolvedValue([]) }
      const res = await service.getRanking('hk')
      expect(res).toEqual([])
    })
  })
})
