import { Injectable, Logger } from '@nestjs/common'
import { SitesService } from '../../sites/sites.service'
import { PlaysService } from '../../plays/plays.service'
import { PageEditorService } from '../../page-editor/page-editor.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

// ─── 建站默认玩法（全量32条，按采种各建一套）────────────────────────────────

const DEFAULT_PLAYS: { rule_code: string; name: string }[] = [
  // 生肖系
  { rule_code: '20001', name: '平特一肖' },
  { rule_code: '20010', name: '绝杀一肖' },
  { rule_code: '20022', name: '绝杀二肖' },
  { rule_code: '20020', name: '绝杀三肖' },
  { rule_code: '20028', name: '六肖中特' },
  { rule_code: '20014', name: '七肖中特' },
  { rule_code: '20021', name: '九肖中特' },
  { rule_code: '20029', name: '平特六肖' },
  { rule_code: '20016', name: '家禽野兽' },
  { rule_code: '20017', name: '文肖武肖' },
  { rule_code: '20018', name: '前肖后肖' },
  { rule_code: '20019', name: '阴肖阳肖' },
  { rule_code: '20026', name: '三国选一' },
  // 属性系
  { rule_code: '20005', name: '单双中特' },
  { rule_code: '20006', name: '大小中特' },
  { rule_code: '20003', name: '二波中特' },
  { rule_code: '20023', name: '三头中特' },
  { rule_code: '20027', name: '三行中特' },
  { rule_code: '20002', name: '平特一尾' },
  { rule_code: '20015', name: '七尾中特' },
  // 绝杀系
  { rule_code: '20004', name: '绝杀五码' },
  { rule_code: '20007', name: '绝杀二尾' },
  { rule_code: '20008', name: '绝杀一头' },
  { rule_code: '20009', name: '绝杀二行' },
  { rule_code: '20011', name: '绝杀二个半波' },
  { rule_code: '20012', name: '绝杀二段' },
  { rule_code: '20013', name: '绝杀二合' },
  { rule_code: '20024', name: '绝杀五尾' },
  { rule_code: '20025', name: '绝杀三尾' },
  // 多期系
  { rule_code: '30001', name: '三期三肖' },
  { rule_code: '30002', name: '三期六码' },
  { rule_code: '30003', name: '五期五肖' },
]

@Injectable()
export class SiteExecutor implements IExecutor {
  readonly domains = ['site']
  private readonly logger = new Logger(SiteExecutor.name)

  constructor(
    private sitesService:      SitesService,
    private playsService:      PlaysService,
    private pageEditorService: PageEditorService,
  ) {}

  async execute(dsl: CommandDsl, taskId: bigint): Promise<ExecutionResult> {
    switch (dsl.intent) {
      case 'site_create':
        return this.createSite(dsl, taskId)

      case 'site_publish':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.publish(BigInt(dsl.site_id))
        return this.ok('站点已发布')

      case 'site_suspend':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.suspend(BigInt(dsl.site_id))
        return this.ok('站点已暂停')

      case 'site_delete':
        if (!dsl.site_id) return this.err('缺少 site_id')
        await this.sitesService.remove(BigInt(dsl.site_id))
        return this.ok('站点已删除')

      case 'site_clone':
        return this.cloneSite(dsl, taskId)

      default:
        return this.err(`未知操作: ${dsl.intent}`)
    }
  }

  // ─── 创建站点 ─────────────────────────────────────────────────────────────

  private async createSite(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const p          = dsl.params
    const operatorId = dsl.user_id ? BigInt(dsl.user_id) : null
    const lotteryTypes: string[] = p.lottery_types ?? (p.lottery_type ? [p.lottery_type] : ['hk'])
    const playCount  = Number(p.play_count ?? 50) || 50

    // 1. 创建站点记录
    const site = await this.sitesService.create({
      name:          p.site_name ?? `站点_${Date.now()}`,
      lottery_types: lotteryTypes,
      theme:         p.theme      ?? 'theme_default',
      layout:        p.layout_code ?? 'layout_a',
    }, operatorId)

    // 2. 初始化页面布局（插槽）
    const pageTypes = ['home', 'results', 'play_detail', 'statistics']
    for (const pt of pageTypes) {
      try {
        await this.pageEditorService.initPage(BigInt(site.id), {
          page_type:   pt,
          layout_code: p.layout_code ?? 'layout_a',
          play_count:  playCount,
          ad_count:    Number(p.ad_count  ?? 10) || 10,
          cat_count:   Number(p.cat_count ?? 3)  || 3,
        }, operatorId)
      } catch (_) { /* 已初始化则跳过 */ }
    }

    // 3. 批量创建默认玩法（每个采种各一套）
    const plays  = DEFAULT_PLAYS.slice(0, playCount)
    let playSeeded = 0
    for (const lt of lotteryTypes) {
      for (let i = 0; i < plays.length; i++) {
        const t = plays[i]
        try {
          await this.playsService.create({
            site_id:      parseInt(site.id),
            lottery_type: lt,
            rule_code:    t.rule_code,
            name:         t.name,
            sort_no:      i + 1,
          }, operatorId)
          playSeeded++
        } catch (e: any) {
          this.logger.warn(`跳过玩法 ${t.name}(${lt}): ${e.message}`)
        }
      }
    }

    return {
      success: true,
      message: `站点 "${site.name}" 创建成功，初始化 ${pageTypes.length} 个页面，写入 ${playSeeded} 个玩法`,
      data:    { site_id: site.id, site_name: site.name, site_code: site.code, plays_seeded: playSeeded },
      rollback_id: `site:${site.id}`,
    }
  }

  // ─── 复制站点 ─────────────────────────────────────────────────────────────

  private async cloneSite(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const cloned = await this.sitesService.clone(
      dsl.params.site_name ?? '',
      dsl.user_id ? BigInt(dsl.user_id) : undefined,
    )
    if (!cloned) return this.err(`源站点 "${dsl.params.site_name}" 不存在`)

    return { success: true, message: `站点已复制，新站点 ID: ${cloned.id}`, data: cloned }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true,  message, data } }
  private err(message: string):             ExecutionResult { return { success: false, message } }
}
