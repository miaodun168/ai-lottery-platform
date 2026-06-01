import { IsNumber, IsOptional, IsString } from 'class-validator'

export class RebuildDto {
  @IsNumber()
  site_id: number

  @IsString()
  lottery_type: string

  @IsOptional()
  @IsNumber()
  year?: number
}
