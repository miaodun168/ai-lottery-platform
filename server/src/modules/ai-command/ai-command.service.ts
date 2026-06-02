import { Injectable } from '@nestjs/common'
import { CommandParser } from './parsers/command-parser'
import { LlmIntentParser } from './parsers/llm-intent-parser'
import { DslGenerator } from './parsers/dsl-generator'
import { EngineRouter } from './executors/engine-router'
import { TaskQueueService } from './task/task-queue.service'
import { CommandDsl } from './types/dsl.types'

export interface AiCommandRequest {
  command:   string
  site_id?:  string
  user_id?:  string
  mode?:     'auto' | 'preview'
  confirmed?: boolean
}

export interface AiCommandResponse {
  task_id:   string
  status:    'pending' | 'running' | 'success' | 'failed' | 'awaiting_confirm'
  preview?:  string[]
  result?:   any
  message:   string
  requires_confirmation?: boolean
  dsls?:     CommandDsl[]
  parsed_by?: 'llm' | 'regex'   // 标识本次由哪个解析器处理
}

@Injectable()
export class AiCommandService {
  constructor(
    private commandParser:  CommandParser,
    private llmParser:      LlmIntentParser,
    private dslGenerator:   DslGenerator,
    private engineRouter:   EngineRouter,
    private taskQueue:      TaskQueueService,
  ) {}

  // ─── 主入口 ───────────────────────────────────────────────────────────────

  async execute(req: AiCommandRequest): Promise<AiCommandResponse> {
    // 1. 解析意图（LLM 优先，失败则回退正则）
    const llmResult = await this.llmParser.parse(req.command)
    const intents   = llmResult ?? this.commandParser.parse(req.command)
    const parsedBy  = llmResult ? 'llm' : 'regex'

    if (!intents.length || intents.every(i => i.action === 'unknown')) {
      return {
        task_id:  '0',
        status:   'failed',
        parsed_by: parsedBy,
        message:  `无法理解命令：${req.command}。请尝试更自然的描述，例如"新增平特一肖玩法"或"切换红色主题"。`,
      }
    }

    // 2. 生成 DSL
    const ctx   = { siteId: req.site_id, userId: req.user_id, mode: req.mode }
    const multi = this.dslGenerator.generateMulti(intents, ctx)

    // 3. 高危操作 → 等待确认
    const riskyDsls = multi.commands.filter(d => d.requires_confirmation)
    if (riskyDsls.length > 0 && !req.confirmed) {
      const previews = multi.commands.map(d => this.dslGenerator.describePreview(d))
      return {
        task_id:               '0',
        status:                'awaiting_confirm',
        preview:               previews,
        dsls:                  multi.commands,
        requires_confirmation: true,
        parsed_by:             parsedBy,
        message:               `以下操作包含高危操作，请确认后执行：\n${previews.join('\n')}`,
      }
    }

    // 4. preview 模式
    if ((req.mode ?? 'preview') === 'preview' && !req.confirmed) {
      const previews = multi.commands.map(d => this.dslGenerator.describePreview(d))
      return {
        task_id:   '0',
        status:    'pending',
        preview:   previews,
        dsls:      multi.commands,
        parsed_by: parsedBy,
        message:   `已解析 ${multi.commands.length} 个操作，确认后执行。`,
      }
    }

    // 5. 创建任务并执行
    const taskId = await this.taskQueue.create(req.command, this.inferTaskType(intents[0].domain))
    await this.taskQueue.updateStatus(taskId, 'running')

    const results: any[] = []
    let stepNo = 0

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
      task_id:   taskId.toString(),
      status:    allSuccess ? 'success' : 'failed',
      result:    results,
      parsed_by: parsedBy,
      message:   allSuccess
        ? `所有操作执行成功（${results.length} 个命令）`
        : `部分操作失败，请查看任务日志`,
    }
  }

  // ─── 意图预览（不执行，返回解析结果）────────────────────────────────────

  async previewIntents(command: string, siteId?: string) {
    const llmResult = await this.llmParser.parse(command)
    const intents   = llmResult ?? this.commandParser.parse(command)
    const parsedBy  = llmResult ? 'llm' : 'regex'

    const ctx     = { siteId }
    const multi   = this.dslGenerator.generateMulti(intents, ctx)
    const preview = multi.commands.map(d => this.dslGenerator.describePreview(d))

    return {
      command,
      parsed_by:    parsedBy,
      parsed_count: multi.commands.length,
      preview,
      dsls:         multi.commands,
      has_risky:    multi.commands.some(d => d.requires_confirmation),
    }
  }

  // ─── 任务查询 ─────────────────────────────────────────────────────────────

  async getTask(taskId: bigint) {
    return this.taskQueue.getTask(taskId)
  }

  async listTasks(page: number, limit: number) {
    return this.taskQueue.listTasks(page, limit)
  }

  async listCommandLogs(siteId?: bigint, page?: number, limit?: number) {
    return this.taskQueue.listCommandLogs(siteId, page, limit)
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
