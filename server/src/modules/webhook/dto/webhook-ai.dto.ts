import { IsOptional, IsString } from 'class-validator'

export class WebhookAiDto {
  @IsOptional()
  @IsString()
  task_id?: string

  @IsOptional()
  payload?: Record<string, any>
}
