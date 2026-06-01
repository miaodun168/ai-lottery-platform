import { Injectable } from '@nestjs/common'
import { WebhookResultDto } from './dto/webhook-result.dto'
import { WebhookAiDto } from './dto/webhook-ai.dto'

@Injectable()
export class WebhookService {
  async handleResult(dto: WebhookResultDto): Promise<any> {
    return null
  }

  async handleAi(dto: WebhookAiDto): Promise<any> {
    return null
  }
}
