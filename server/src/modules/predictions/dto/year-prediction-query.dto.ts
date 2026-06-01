import { IsNumber, IsString } from 'class-validator'

export class YearPredictionQueryDto {
  @IsString()
  site_id: string

  @IsString()
  play_id: string

  @IsNumber()
  year: number
}
