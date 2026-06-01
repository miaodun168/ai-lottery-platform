import { Injectable } from '@nestjs/common'
import { CommandParser } from './parsers/command-parser'
import { DslGenerator } from './parsers/dsl-generator'
import { EngineRouter } from './executors/engine-router'
import { TaskQueueService } from './task/task-queue.service'
import { CommandDsl } from './types/dsl.types'

export interface AiCommandRequest {
  command:   string
  site_id?:  string
  user_id?:  string
  mode?:     'auto' | 'preview'
  confirmed?: boolean   // 高危操作确认标志
}

export interface AiCommandResponse {
  task_id:   string
  status:    'pending' | 'running' | 'success' | 'failed' | 'awaiting_confirm'
  preview?:  string[]   // 操作预览描述
  result?:   any
  message:   string
  requires_confirmation?: boolean
  dsls?:     CommandDsl[]  // 解析出的 DSL（供前端展示）
}

@Injectable()
export class AiCommandService {
  constructor(
    private commandParser: CommandParser,
    private dslGenerator:  DslGenerator,
    private engineRouter:  EngineRouter,
    private taskQueue:     TaskQueueService,
  ) {}

  // ─── 主入口：处理自然语言命令 ────────────────────────────────────────────

  async execute(req: AiCommandRequest): Promise<AiCommandResponse> {
    // 1. 解析意图
    const intents = this.commandParser.parse(req.command)

    if (!intents.length || intents.every(i => i.action === 'unknown')) {
      return {
        task_id: '0',
        status:  'failed',
        message: `无法理解命令：${req.command}。请尝试更明确的描述，例如"新增玩法 平特一肖"或"切换红金主题"。`,
      }
    }

    // 2. 生成 DSL
    const ctx = { siteId: req.site_id, userId: req.user_id, mode: req.mode }
    const multi = this.dslGenerator.generateMulti(intents, ctx)

    // 3. 高危操作检查（未确认时返回 preview）
    const riskyDsls = multi.commands.filter(d => d.requires_confirmation)
    if (riskyDsls.length > 0 && !req.confirmed) {
      const previews = multi.commands.map(d => this.dslGenerator.describePreview(d))
      return {
        task_id:               '0',
        status:                'awaiting_confirm',
        preview:               previews,
        dsls:                  multi.commands,
        requires_confirmation: true,
        message:               `以下操作包含高危操作，请确认后执行：\n${previews.join('\n')}`,
      }
    }

    // 4. preview 模式：只返回预览，不执行
    if ((req.mode ?? 'preview') === 'preview' && !req.confirmed) {
      const previews = multi.commands.map(d => this.dslGenerator.describePreview(d))
      return {
        task_id: '0',
        status:  'pending',
        preview: previews,
        dsls:    multi.commands,
        message: `已解析 ${multi.commands.length} 个操作，确认后执行。`,
      }
    }

    // 5. 创建任务记录
    const taskId = await this.taskQueue.create(req.command, this.inferTaskType(intents[0].domain))
    await this.taskQueue.updateStatus(taskId, 'running')

    const results: any[] = []
    let stepNo = 0

    // 6. 顺序执行所有 DSL
    for (const dsl of multi.commands) {
      const start = Date.now()
      stepNo++

      await this.taskQueue.logStep({
        task_id: taskId, step: stepNo,
        action: dsl.intent, status: 'running',
        message: this.dslGenerator.describePreview(dsl),
      })

      try {
        const result = await this.engineRouter.route(dsl, taskId)
        results.push(result)

        await this.taskQueue.logStep({
          task_id:     taskId,
          step:        stepNo,
          action:      dsl.intent,
          status:      result.success ? 'success' : 'failed',
          message:     result.message,
          data_after:  result.data,
          duration_ms: Date.now() - start,
        })
      } catch (err: any) {
        await this.taskQueue.logStep({
          task_id: taskId, step: stepNo, action: dsl.intent,
          status: 'failed', message: err.message ?? '执行失败',
          duration_ms: Date.now() - start,
        })
        results.push({ success: false, message: err.message })
      }
    }

    // 7. 记录命令日志
    const allSuccess = results.every(r => r.success)
    await this.taskQueue.updateStatus(taskId, allSuccess ? 'success' : 'failed', results)

    await this.taskQueue.logCommand(
      req.command,
      intents[0].action,
      multi.commands[0],
      taskId,
      allSuccess ? 'success' : 'failed',
      results,
      req.user_id ? BigInt(req.user_id) : undefined,
      req.site_id ? BigInt(req.site_id) : undefined,
    )

    return {
      task_id: taskId.toString(),
      status:  allSuccess ? 'success' : 'failed',
      result:  results,
      message: allSuccess
        ? `所有操作执行成功（${results.length} 个命令）`
        : `部分操作失败，请查看任务日志`,
    }
  }

  // ─── 查询任务 ─────────────────────────────────────────────────────────────

  async getTask(taskId: bigint) {
    return this.taskQueue.getTask(taskId)
  }

  async listTasks(page: number, limit: number) {
    return this.taskQueue.listTasks(page, limit)
  }

  async listCommandLogs(siteId?: bigint, page?: number, limit?: number) {
    return this.taskQueue.listCommandLogs(siteId, page, limit)
  }

  // ─── 意图预览（不执行）────────────────────────────────────────────────────

  previewIntents(command: string, siteId?: string) {
    const intents = this.commandParser.parse(command)
    const ctx     = { siteId }
    const multi   = this.dslGenerator.generateMulti(intents, ctx)
    const preview = multi.commands.map(d => this.dslGenerator.describePreview(d))

    return {
      command,
      parsed_count:   multi.commands.length,
      preview,
      dsls:           multi.commands,
      has_risky:      multi.commands.some(d => d.requires_confirmation),
    }
  }

  private inferTaskType(domain: string): string {
    const map: Record<string, string> = {
      site: 'SITE_OPERATION', play: 'PLAY_OPERATION', theme: 'THEME_OPERATION',
      layout: 'LAYOUT_OPERATION', component: 'COMPONENT_OPERATION',
      ad: 'AD_OPERATION', page: 'PAGE_OPERATION', result: 'RESULT_OPERATION',
      rule: 'RULE_OPERATION', statistics: 'STATISTICS_OPERATION', system: 'SYSTEM_OPERATION',
    }
    return map[domain] ?? 'AI_COMMAND'
  }
}
