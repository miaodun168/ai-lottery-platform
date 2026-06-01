import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { GeneratorService } from './generator.service'
import { SiteBuilderService } from '../../engines/site-builder/site-builder.service'
import { StatisticsEngine } from '../../engines/statistics/statistics.engine'
import { SettlementService } from '../settlement/settlement.service'
import { PrismaService } from '../../prisma/prisma.service'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSite = { id: 1n, name: '财富阁', code: 'cfa' }
const mockPlay = { id: 10n, site_id: 1n, lottery_type: 'hk', rule_code: 'R001', status: 'active', name: '平特一肖' }
const mockSummary = { hit_rate: 70, hit_count: 7, total_count: 10 }

function buildPrisma(overrides: Record<string, any> = {}) {
  return {
    site:              { findUnique: jest.fn().mockResolvedValue(mockSite) },
    page:              { findMany: jest.fn().mockResolvedValue([{ id: 1n }, { id: 2n }]) },
    play:              { findUnique: jest.fn().mockResolvedValue(mockPlay), findMany: jest.fn().mockResolvedValue([mockPlay]) },
    statisticsSummary: { findFirst: jest.fn().mockResolvedValue(mockSummary), findMany: jest.fn().mockResolvedValue([mockSummary]) },
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GeneratorService', () => {
  let service: GeneratorService
  let prisma: any
  let siteBuilder: any
  let settlementService: any

  beforeEach(async () => {
    prisma           = buildPrisma()
    siteBuilder      = { initDefaultPages: jest.fn().mockResolvedValue(undefined) }
    settlementService = {
      refreshStatistics: jest.fn().mockResolvedValue(undefined),
      settleYear:        jest.fn().mockResolvedValue({ total_settled: 10, plays_processed: 5 }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorService,
        { provide: PrismaService,      useValue: prisma },
        { provide: SiteBuilderService, useValue: siteBuilder },
        { provide: StatisticsEngine,   useValue: {} },
        { provide: SettlementService,  useValue: settlementService },
      ],
    }).compile()

    service = module.get(GeneratorService)
  })

  // ── generateSite ─────────────────────────────────────────────────────────

  describe('generateSite', () => {
    it('사이트 없으면 NotFoundException', async () => {
      prisma.site.findUnique.mockResolvedValue(null)
      await expect(service.generateSite({ site_id: 999 })).rejects.toThrow(NotFoundException)
    })

    it('initDefaultPages 호출 후 페이지 수 반환', async () => {
      const res = await service.generateSite({ site_id: 1 })
      expect(siteBuilder.initDefaultPages).toHaveBeenCalledWith(1n)
      expect(res.pages_created).toBe(2)
      expect(res.site_name).toBe('财富阁')
    })
  })

  // ── generatePlay ─────────────────────────────────────────────────────────

  describe('generatePlay', () => {
    it('플레이 없으면 NotFoundException', async () => {
      prisma.play.findUnique.mockResolvedValue(null)
      await expect(service.generatePlay({ site_id: 1, play_id: 999 })).rejects.toThrow(NotFoundException)
    })

    it('refreshStatistics 호출 후 통계 반환', async () => {
      const res = await service.generatePlay({ site_id: 1, play_id: 10 })
      expect(settlementService.refreshStatistics).toHaveBeenCalledWith(10n, 'hk', mockPlay.site_id)
      expect(res.play_name).toBe('平特一肖')
      expect(res.hit_rate).toBe(70)
    })
  })

  // ── generateYear ─────────────────────────────────────────────────────────

  describe('generateYear', () => {
    it('플레이 없으면 plays_processed=0', async () => {
      prisma.play.findMany.mockResolvedValue([])
      const res = await service.generateYear({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(res.plays_processed).toBe(0)
    })

    it('플레이별 refreshStatistics 호출', async () => {
      const res = await service.generateYear({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(settlementService.refreshStatistics).toHaveBeenCalledTimes(1)
      expect(res.total_plays).toBe(1)
    })
  })

  // ── rebuild ──────────────────────────────────────────────────────────────

  describe('rebuild', () => {
    it('플레이 없으면 plays_processed=0', async () => {
      prisma.play.findMany.mockResolvedValue([])
      const res = await service.rebuild({ site_id: 1, lottery_type: 'hk' })
      expect(res.plays_total).toBe(0)
    })

    it('year 없으면 settleYear 미호출', async () => {
      await service.rebuild({ site_id: 1, lottery_type: 'hk' })
      expect(settlementService.settleYear).not.toHaveBeenCalled()
    })

    it('year 있으면 settleYear + refreshStatistics 모두 호출', async () => {
      const res = await service.rebuild({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(settlementService.settleYear).toHaveBeenCalledWith({ site_id: 1, lottery_type: 'hk', year: 2026 })
      expect(settlementService.refreshStatistics).toHaveBeenCalledTimes(1)
      expect(res.stats_processed).toBe(1)
    })

    it('결과 메시지 포함', async () => {
      const res = await service.rebuild({ site_id: 1, lottery_type: 'hk' })
      expect(res.message).toContain('重建完成')
    })
  })
})
