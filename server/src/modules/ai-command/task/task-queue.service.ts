import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { TaskStatus, TaskLogStep } from '../types/task.types'

@Injectable()
export class TaskQueueService {
  constructor(private prisma: PrismaService) {}

  // ─── 创建 AI 任务 ─────────────────────────────────────────────────────────

  async create(commandText: string, taskType: string): Promise<bigint> {
    const task = await this.prisma.aiTask.create({
      data: {
        task_type:    taskType,
        command_text: commandText,
        status:       'pending',
        created_at:   new Date(),
      },
    })
    return task.id
  }

  // ─── 更新任务状态 ─────────────────────────────────────────────────────────

  async updateStatus(taskId: bigint, status: TaskStatus, resultJson?: any) {
    await this.prisma.aiTask.update({
      where: { id: taskId },
      data:  {
        status,
        result_json: resultJson ?? undefined,
        finished_at: ['success','failed','rollback'].includes(status) ? new Date() : undefined,
      },
    })
  }

  // ─── 写日志步骤 ───────────────────────────────────────────────────────────

  async logStep(step: TaskLogStep) {
    await this.prisma.aiTaskLog.create({
      data: {
        task_id:     step.task_id,
        step:        step.step,
        action:      step.action,
        status:      step.status,
        message:     step.message,
        data_before: step.data_before ?? undefined,
        data_after:  step.data_after  ?? undefined,
        duration_ms: step.duration_ms,
        created_at:  new Date(),
      },
    })
  }

  // ─── 记录命令日志 ─────────────────────────────────────────────────────────

  async logCommand(
    command:  string,
    intent:   string,
    dsl:      any,
    taskId:   bigint,
    status:   TaskStatus,
    result?:  any,
    userId?:  bigint,
    siteId?:  bigint,
  ) {
    await this.prisma.aiCommandLog.create({
      data: {
        site_id:    siteId    ?? null,
        user_id:    userId    ?? null,
        command,
        intent,
        dsl:        dsl       ?? {},
        task_id:    taskId,
        status,
        result:     result    ?? {},
        created_at: new Date(),
      },
    })
  }

  // ─── 获取任务详情 ─────────────────────────────────────────────────────────

  async getTask(taskId: bigint) {
    const task = await this.prisma.aiTask.findUnique({ where: { id: taskId } })
    if (!task) return null

    const logs = await this.prisma.aiTaskLog.findMany({
      where:   { task_id: taskId },
      orderBy: { step: 'asc' },
    })

    return {
      id:           task.id.toString(),
      task_type:    task.task_type,
      command_text: task.command_text,
      status:       task.status,
      result:       task.result_json,
      created_at:   task.created_at,
      finished_at:  task.finished_at,
      logs:         logs.map(l => ({
        step:    l.step,
        action:  l.action,
        status:  l.status,
        message: l.message,
        duration_ms: l.duration_ms,
      })),
    }
  }

  // ─── 任务列表 ─────────────────────────────────────────────────────────────

  async listTasks(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [tasks, total] = await Promise.all([
      this.prisma.aiTask.findMany({ orderBy: { created_at: 'desc' }, skip, take: limit }),
      this.prisma.aiTask.count(),
    ])
    return {
      total, page, limit,
      items: tasks.map(t => ({
        id:          t.id.toString(),
        task_type:   t.task_type,
        command_text:t.command_text,
        status:      t.status,
        created_at:  t.created_at,
        finished_at: t.finished_at,
      })),
    }
  }

  // ─── 命令日志列表 ─────────────────────────────────────────────────────────

  async listCommandLogs(siteId?: bigint, page = 1, limit = 20) {
    const skip  = (page - 1) * limit
    const where = siteId ? { site_id: siteId } : {}
    const [logs, total] = await Promise.all([
      this.prisma.aiCommandLog.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit }),
      this.prisma.aiCommandLog.count({ where }),
    ])
    return {
      total, page, limit,
      items: logs.map(l => ({
        id:         l.id.toString(),
        command:    l.command,
        intent:     l.intent,
        status:     l.status,
        created_at: l.created_at,
      })),
    }
  }
}
