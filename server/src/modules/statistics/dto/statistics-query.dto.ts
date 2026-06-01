import { IsOptional, IsString } from 'class-validator'

export class StatisticsQueryDto {
  @IsOptional()
  @IsString()
  site_id?: string

  @IsOptional()
  @IsString()
  play_id?: string

  @IsOptional()
  @IsString()
  lottery_type?: string
}
