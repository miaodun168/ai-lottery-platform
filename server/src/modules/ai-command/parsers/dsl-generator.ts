import { Injectable } from '@nestjs/common'
import { ParsedIntent } from '../types/intent.types'
import { CommandDsl, MultiCommandDsl } from '../types/dsl.types'

@Injectable()
export class DslGenerator {

  // ─── 单意图 → CommandDsl ──────────────────────────────────────────────

  generate(intent: ParsedIntent, ctx: { siteId?: string; userId?: string; mode?: 'auto' | 'preview' } = {}): CommandDsl {
    return {
      version:               '1.0',
      intent:                intent.action,
      domain:                intent.domain,
      site_id:               ctx.siteId,
      user_id:               ctx.userId,
      params:                intent.params,
      execution_mode:        ctx.mode ?? 'preview',
      requires_confirmation: intent.requires_confirmation,
      raw_command:           intent.raw,
      created_at:            new Date().toISOString(),
    }
  }

  // ─── 多意图 → MultiCommandDsl ────────────────────────────────────────

  generateMulti(intents: ParsedIntent[], ctx: { siteId?: string; userId?: string; mode?: 'auto' | 'preview' } = {}): MultiCommandDsl {
    const commands = intents.map(i => this.generate(i, ctx))

    // 同域且可并行的命令并行执行（如玩法+广告+栏目）
    const parallelDomains = new Set(['play', 'ad', 'page'])
    const parallel = commands.every(c => parallelDomains.has(c.domain)) && commands.length > 1

    return { commands, parallel }
  }

  // ─── 预览描述（给用户看的可读化描述）────────────────────────────────

  describePreview(dsl: CommandDsl): string {
    const p = dsl.params
    const descriptions: Record<string, string> = {
      site_create:             `将创建站点${p.site_name ? `"${p.site_name}"` : ''}，采种: ${p.lottery_type ?? 'hk'}，主题: ${p.theme ?? '默认'}，${p.play_count ?? 50}个玩法，${p.ad_count ?? 10}个广告`,
      site_delete:             `将删除站点${p.site_name ? `"${p.site_name}"` : ''}（高危操作，需确认）`,
      site_clone:              `将复制站点${p.site_name ? `"${p.site_name}"` : ''}`,
      site_publish:            `将发布站点${p.site_name ? `"${p.site_name}"` : ''}`,
      change_theme:            `将切换主题为 ${p.theme ?? '默认主题'}`,
      create_theme:            `将创建新主题: ${p.theme ?? '自定义主题'}`,
      change_layout:           `将切换布局为 ${p.layout_code ?? 'layout_a'}`,
      modify_layout:           `将修改布局参数: 广告数量 ${p.ad_count}`,
      add_play_modules:        `将新增 ${p.count ?? 10} 个玩法模块`,
      move_component:          `将 ${p.component_type ?? '组件'} 移动到 ${p.position ?? '指定位置'}`,
      create_play:             `将创建玩法: ${p.play_name ?? '未指定'}`,
      batch_create_play:       `将批量创建 ${p.count ?? 20} 个 ${p.play_name ?? ''} 玩法`,
      delete_play:             `将删除玩法: ${p.keyword ?? ''}（高危操作，需确认）`,
      hide_play:               `将停用玩法: ${p.keyword ?? p.condition ?? ''}`,
      change_component_template: `将 ${p.component_type ?? 'play_card'} 切换到模板 ${p.template ?? 'card_01'}`,
      add_component:           `将新增组件: ${p.component_type ?? '未指定'}`,
      remove_component:        `将删除组件: ${p.component_type ?? '未指定'}`,
      add_ad:                  `将新增 ${p.count ?? 1} 个广告`,
      remove_all_ads:          `将删除所有广告（高危操作，需确认）`,
      remove_ad:               `将删除 ${p.count ?? 1} 个广告`,
      generate_ad:             `将生成 ${p.count ?? 1} 个广告（主题: ${p.theme ?? '默认'}）`,
      create_page:             `将创建页面: ${p.page_name ?? ''}`,
      delete_page:             `将删除页面: ${p.page_name ?? ''}`,
      create_result:           `将录入第 ${p.period ?? ''} 期开奖结果`,
      update_result:           `将修改第 ${p.period ?? ''} 期开奖结果（自动触发重算）`,
      update_rule:             `将修改规则 ${p.rule_name ?? ''} = ${p.rule_value}`,
      rebuild_statistics:      `将重算所有统计数据`,
      flush_cache:             `将刷新系统缓存`,
    }
    return descriptions[dsl.intent] ?? `将执行操作: ${dsl.intent}`
  }
}
