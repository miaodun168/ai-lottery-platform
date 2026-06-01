import { IsOptional, IsString } from 'class-validator'

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  seo_title?: string

  @IsOptional()
  @IsString()
  seo_keywords?: string

  @IsOptional()
  @IsString()
  seo_description?: string
}
