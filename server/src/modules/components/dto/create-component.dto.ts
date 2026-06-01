import { IsOptional, IsString } from 'class-validator'

export class CreateComponentDto {
  @IsString()
  component_code: string

  @IsString()
  component_name: string

  @IsString()
  component_type: string

  @IsOptional()
  config_json?: Record<string, any>
}
