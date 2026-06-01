import { IsArray, IsOptional, IsString } from 'class-validator'

export class CreateSiteDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  theme?: string

  @IsOptional()
  @IsString()
  layout?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lottery_types?: string[]
}
