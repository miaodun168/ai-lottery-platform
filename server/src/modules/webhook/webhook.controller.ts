import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { WebhookService } from './webhook.service'
import { WebhookResultDto } from './dto/webhook-result.dto'
import { WebhookAiDto } from './dto/webhook-ai.dto'

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('result')
  handleResult(@Body() dto: WebhookResultDto) {
    return this.webhookService.handleResult(dto)
  }

  @Post('ai')
  handleAi(@Body() dto: WebhookAiDto) {
    return this.webhookService.handleAi(dto)
  }
}
