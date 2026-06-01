import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePageDto {
  @IsNumber()
  site_id: number

  @IsString()
  name: string

  @IsString()
  slug: string

  @IsOptional()
  @IsString()
  page_type?: string

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
