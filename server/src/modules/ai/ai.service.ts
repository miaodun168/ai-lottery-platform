import { Injectable } from '@nestjs/common'
import { AiCommandService } from '../ai-command/ai-command.service'
import { AiCommandDto } from './dto/ai-command.dto'
import { AiSiteGenerateDto } from './dto/ai-site-generate.dto'
import { AiSiteUpdateDto } from './dto/ai-site-update.dto'
import { AiPlayGenerateDto } from './dto/ai-play-generate.dto'

@Injectable()
export class AiService {
  constructor(private aiCommandService: AiCommandService) {}

  async executeCommand(dto: AiCommandDto) {
    return this.aiCommandService.execute({
      command:   dto.command,
      site_id:   dto.site_id,
      user_id:   dto.user_id,
      mode:      dto.mode,
      confirmed: dto.confirmed,
    })
  }

  async previewCommand(dto: AiCommandDto) {
    return this.aiCommandService.previewIntents(dto.command, dto.site_id)
  }

  async getTask(id: bigint) {
    return this.aiCommandService.getTask(id)
  }

  async listTasks(page: number, limit: number) {
    return this.aiCommandService.listTasks(page, limit)
  }

  async listCommandLogs(siteId?: bigint, page?: number, limit?: number) {
    return this.aiCommandService.listCommandLogs(siteId, page, limit)
  }

  // ── 结构化入口（保留，用于前端直接调用各引擎）──────────────────────────────

  async siteGenerate(dto: AiSiteGenerateDto): Promise<{ task_id: string }> {
    const lotteryHint = dto.lottery_types?.includes('mo') ? '澳门' : '香港'
    return this.aiCommandService.execute({
      command: `创建一个${lotteryHint}站${dto.description ? ' ' + dto.description : ''}`,
      mode:    'auto',
    }) as any
  }

  async siteUpdate(dto: AiSiteUpdateDto): Promise<{ task_id: string }> {
    return this.aiCommandService.execute({
      command: dto.instruction,
      site_id: dto.site_id?.toString(),
      mode:    'auto',
    }) as any
  }

  async playGenerate(dto: AiPlayGenerateDto): Promise<{ task_id: string }> {
    return this.aiCommandService.execute({
      command: `批量创建${dto.count ?? 20}个玩法`,
      site_id: dto.site_id?.toString(),
      mode:    'auto',
    }) as any
  }
}
