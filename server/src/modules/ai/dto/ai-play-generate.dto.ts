import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class AiPlayGenerateDto {
  @IsNumber()
  site_id: number

  @IsString()
  lottery_type: string

  @IsOptional()
  @IsNumber()
  count?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rule_codes?: string[]
}
