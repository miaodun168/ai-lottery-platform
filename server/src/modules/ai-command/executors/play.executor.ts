import { Injectable } from '@nestjs/common'
import { PlaysService } from '../../plays/plays.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

// 预设玩法批量模板
const PLAY_BATCH_TEMPLATES: Record<string, { rule_code: string; name_prefix: string }[]> = {
  '生肖玩法': [
    { rule_code: '20001', name_prefix: '平特一肖' },
    { rule_code: '20014', name_prefix: '七肖中特' },
    { rule_code: '20028', name_prefix: '六肖中特' },
    { rule_code: '20029', name_prefix: '平特六肖' },
    { rule_code: '20021', name_prefix: '九肖中特' },
    { rule_code: '20010', name_prefix: '绝杀一肖' },
    { rule_code: '20020', name_prefix: '绝杀三肖' },
    { rule_code: '20022', name_prefix: '绝杀二肖' },
    { rule_code: '20016', name_prefix: '家禽野兽' },
    { rule_code: '20017', name_prefix: '文肖武肖' },
    { rule_code: '20018', name_prefix: '前肖后肖' },
    { rule_code: '20019', name_prefix: '阴肖阳肖' },
    { rule_code: '20026', name_prefix: '三国选一' },
    { rule_code: '30001', name_prefix: '三期三肖' },
    { rule_code: '30003', name_prefix: '五期五肖' },
  ],
  '属性玩法': [
    { rule_code: '20005', name_prefix: '单双中特' },
    { rule_code: '20006', name_prefix: '大小中特' },
    { rule_code: '20003', name_prefix: '二波中特' },
    { rule_code: '20023', name_prefix: '三头中特' },
    { rule_code: '20027', name_prefix: '三行中特' },
    { rule_code: '20002', name_prefix: '平特一尾' },
    { rule_code: '20015', name_prefix: '七尾中特' },
  ],
  '绝杀玩法': [
    { rule_code: '20004', name_prefix: '绝杀五码' },
    { rule_code: '20007', name_prefix: '绝杀二尾' },
    { rule_code: '20008', name_prefix: '绝杀一头' },
    { rule_code: '20009', name_prefix: '绝杀二行' },
    { rule_code: '20011', name_prefix: '绝杀半波' },
    { rule_code: '20012', name_prefix: '绝杀二段' },
    { rule_code: '20024', name_prefix: '绝杀五尾' },
    { rule_code: '20025', name_prefix: '绝杀三尾' },
  ],
}

@Injectable()
export class PlayExecutor implements IExecutor {
  readonly domains = ['play']

  constructor(private playsService: PlaysService) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    if (!dsl.site_id) return { success: false, message: '缺少 site_id，请先指定站点' }

    const operatorId = dsl.user_id ? BigInt(dsl.user_id) : null

    switch (dsl.intent) {
      case 'create_play':
        return this.createSingle(dsl, operatorId)

      case 'batch_create_play':
        return this.createBatch(dsl, operatorId)

      case 'delete_play':
        return this.deletePlays(dsl, operatorId)

      case 'hide_play':
        return this.hidePlays(dsl, operatorId)

      default:
        return { success: false, message: `未知玩法操作: ${dsl.intent}` }
    }
  }

  private async createSingle(dsl: CommandDsl, operatorId: bigint | null): Promise<ExecutionResult> {
    const p = dsl.params
    if (!p.play_name) return { success: false, message: '缺少玩法名称' }

    // 根据玩法名查找 rule_code
    const ruleCode = this.findRuleCode(p.play_name)
    if (!ruleCode) return { success: false, message: `未找到玩法 "${p.play_name}" 对应的规则，请检查规则库` }

    const play = await this.playsService.create({
      site_id:      parseInt(dsl.site_id),
      lottery_type: dsl.params.lottery_type ?? 'hk',
      rule_code:    ruleCode,
      name:         p.play_name,
    }, operatorId)

    return { success: true, message: `玩法 "${p.play_name}" 创建成功`, data: play }
  }

  private async createBatch(dsl: CommandDsl, operatorId: bigint | null): Promise<ExecutionResult> {
    const p = dsl.params
    const count = p.count ?? 20
    const keyword = p.play_name ?? ''

    // 找匹配的模板集合
    const templates = this.findBatchTemplates(keyword, count)
    if (templates.length === 0) return { success: false, message: `未找到匹配 "${keyword}" 的批量玩法模板` }

    const created: any[] = []
    for (const t of templates.slice(0, count)) {
      try {
        const play = await this.playsService.create({
          site_id:      parseInt(dsl.site_id),
          lottery_type: dsl.params.lottery_type ?? 'hk',
          rule_code:    t.rule_code,
          name:         t.name_prefix,
        }, operatorId)
        created.push(play)
      } catch (_) {}
    }

    return { success: true, message: `批量创建 ${created.length} 个玩法完成`, data: { count: created.length } }
  }

  private async deletePlays(dsl: CommandDsl, operatorId: bigint | null): Promise<ExecutionResult> {
    const keyword = dsl.params.keyword ?? ''
    const plays = await this.playsService.findAll({ site_id: dsl.site_id })
    const targets = plays.filter(p => keyword ? p.name.includes(keyword) : false)

    for (const p of targets) {
      await this.playsService.remove(BigInt(p.id), operatorId)
    }

    return { success: true, message: `已删除 ${targets.length} 个玩法`, data: { deleted: targets.length } }
  }

  private async hidePlays(dsl: CommandDsl, operatorId: bigint | null): Promise<ExecutionResult> {
    const keyword   = dsl.params.keyword ?? ''
    const condition = dsl.params.condition
    const plays     = await this.playsService.findAll({ site_id: dsl.site_id })

    let targets = plays
    if (keyword) targets = plays.filter(p => p.name.includes(keyword))

    for (const p of targets) {
      await this.playsService.setStatus(BigInt(p.id), 'disabled', operatorId)
    }

    return { success: true, message: `已停用 ${targets.length} 个玩法` }
  }

  private findRuleCode(playName: string): string | null {
    const map: Record<string, string> = {
      '平特一肖':'20001','平特一尾':'20002','二波中特':'20003','绝杀五码':'20004',
      '单双中特':'20005','大小中特':'20006','绝杀二尾':'20007','绝杀一头':'20008',
      '绝杀二行':'20009','绝杀一肖':'20010','绝杀半波':'20011','绝杀二段':'20012',
      '绝杀二合':'20013','七肖中特':'20014','七尾中特':'20015','家禽野兽':'20016',
      '文肖武肖':'20017','前肖后肖':'20018','阴肖阳肖':'20019','绝杀三肖':'20020',
      '九肖中特':'20021','绝杀二肖':'20022','三头中特':'20023','绝杀五尾':'20024',
      '绝杀三尾':'20025','三国选一':'20026','三行中特':'20027','六肖中特':'20028',
      '平特六肖':'20029','三期三肖':'30001','三期六码':'30002','五期五肖':'30003',
    }
    return map[playName] ?? null
  }

  private findBatchTemplates(keyword: string, count: number) {
    // 匹配预设批量集合
    for (const [key, templates] of Object.entries(PLAY_BATCH_TEMPLATES)) {
      if (keyword && key.includes(keyword)) return templates.slice(0, count)
      if (!keyword && key === '生肖玩法') return templates.slice(0, count)
    }
    // fallback：返回生肖玩法
    return PLAY_BATCH_TEMPLATES['生肖玩法'].slice(0, count)
  }
}
