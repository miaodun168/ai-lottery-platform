import { IsNumber, IsOptional } from 'class-validator'

export class AiGenerateAdDto {
  @IsNumber()
  site_id: number

  @IsOptional()
  @IsNumber()
  count?: number
}
