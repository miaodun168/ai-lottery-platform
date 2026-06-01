import { IsOptional, IsString } from 'class-validator'

export class WebhookResultDto {
  @IsOptional()
  @IsString()
  lottery_type?: string

  @IsOptional()
  @IsString()
  period?: string

  @IsOptional()
  payload?: Record<string, any>
}
