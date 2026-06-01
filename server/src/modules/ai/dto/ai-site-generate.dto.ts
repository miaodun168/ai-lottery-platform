import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class AiSiteGenerateDto {
  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lottery_types?: string[]

  @IsOptional()
  @IsNumber()
  theme_id?: number

  @IsOptional()
  @IsNumber()
  layout_id?: number
}
