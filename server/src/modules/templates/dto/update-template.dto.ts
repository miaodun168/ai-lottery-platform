import { IsOptional, IsString } from 'class-validator'

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  config?: Record<string, any>
}
