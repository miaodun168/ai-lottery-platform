import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AiService } from './ai.service'
import { AiCommandDto } from './dto/ai-command.dto'
import { AiSiteGenerateDto } from './dto/ai-site-generate.dto'
import { AiSiteUpdateDto } from './dto/ai-site-update.dto'
import { AiPlayGenerateDto } from './dto/ai-play-generate.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('Admin', 'SuperAdmin')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ── 核心：自然语言命令执行 ─────────────────────────────────────────────────

  @Post('command')
  @ApiOperation({ summary: '执行AI自然语言命令' })
  executeCommand(@Body() dto: AiCommandDto) {
    return this.aiService.executeCommand(dto)
  }

  @Post('preview')
  @ApiOperation({ summary: '预览AI命令解析结果（不执行）' })
  previewCommand(@Body() dto: AiCommandDto) {
    return this.aiService.previewCommand(dto)
  }

  // ── 任务查询 ──────────────────────────────────────────────────────────────

  @Get('tasks')
  @ApiOperation({ summary: '任务列表' })
  listTasks(
    @Query('page')  page  = '1',
    @Query('limit') limit = '20',
  ) {
    return this.aiService.listTasks(parseInt(page), parseInt(limit))
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: '任务详情（含执行步骤）' })
  getTask(@Param('id') id: string) {
    return this.aiService.getTask(BigInt(id))
  }

  // ── 命令日志 ──────────────────────────────────────────────────────────────

  @Get('command-logs')
  @ApiOperation({ summary: '命令执行日志' })
  listCommandLogs(
    @Query('site_id') siteId?: string,
    @Query('page')    page    = '1',
    @Query('limit')   limit   = '20',
  ) {
    return this.aiService.listCommandLogs(
      siteId ? BigInt(siteId) : undefined,
      parseInt(page),
      parseInt(limit),
    )
  }

  // ── 结构化入口（保留兼容性）────────────────────────────────────────────────

  @Post('site-generate')
  @ApiOperation({ summary: '结构化建站' })
  siteGenerate(@Body() dto: AiSiteGenerateDto) {
    return this.aiService.siteGenerate(dto)
  }

  @Post('site-update')
  @ApiOperation({ summary: '结构化更新站点' })
  siteUpdate(@Body() dto: AiSiteUpdateDto) {
    return this.aiService.siteUpdate(dto)
  }

  @Post('play-generate')
  @ApiOperation({ summary: '结构化批量生成玩法' })
  playGenerate(@Body() dto: AiPlayGenerateDto) {
    return this.aiService.playGenerate(dto)
  }
}
