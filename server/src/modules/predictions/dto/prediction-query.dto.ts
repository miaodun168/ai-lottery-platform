import { IsOptional, IsString } from 'class-validator'

export class PredictionQueryDto {
  @IsOptional()
  @IsString()
  site_id?: string

  @IsOptional()
  @IsString()
  play_id?: string

  @IsOptional()
  @IsString()
  lottery_type?: string

  @IsOptional()
  @IsString()
  year?: string

  @IsOptional()
  @IsString()
  period?: string
}
