import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePlayDto {
  @IsNumber()
  site_id: number

  @IsString()
  lottery_type: string

  @IsString()
  rule_code: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  alias_name?: string

  @IsOptional()
  @IsNumber()
  sort_no?: number
}
