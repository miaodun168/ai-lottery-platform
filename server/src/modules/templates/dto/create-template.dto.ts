import { IsOptional, IsString } from 'class-validator'

export class CreateTemplateDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  config?: Record<string, any>
}
