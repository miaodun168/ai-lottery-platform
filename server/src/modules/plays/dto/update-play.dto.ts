import { IsOptional, IsString, IsNumber } from 'class-validator'

export class UpdatePlayDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  alias_name?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsNumber()
  sort_no?: number
}
