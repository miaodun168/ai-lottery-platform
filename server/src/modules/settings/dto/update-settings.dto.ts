import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateSettingsDto {
  @IsOptional() @IsNumber()  miss_hide_limit?: number
  @IsOptional() @IsBoolean() show_updating?: boolean
  @IsOptional() @IsNumber()  updating_count?: number
  @IsOptional() @IsBoolean() enable_ai?: boolean
  @IsOptional() @IsBoolean() enable_cache?: boolean
  @IsOptional() @IsBoolean() enable_statistics?: boolean
  @IsOptional() @IsBoolean() enable_auto_settlement?: boolean
  @IsOptional() @IsBoolean() enable_auto_publish?: boolean
  @IsOptional() @IsString()  system_name?: string
  @IsOptional() @IsString()  timezone?: string
  @IsOptional() @IsString()  seo_title?: string
  @IsOptional() @IsString()  seo_keywords?: string
  @IsOptional() @IsString()  seo_description?: string
}
