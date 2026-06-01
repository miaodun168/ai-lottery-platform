import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator'

export class AiCommandDto {
  @IsString()
  command: string

  @IsOptional()
  @IsString()
  site_id?: string

  @IsOptional()
  @IsString()
  user_id?: string

  @IsOptional()
  @IsIn(['auto', 'preview'])
  mode?: 'auto' | 'preview'

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean
}
