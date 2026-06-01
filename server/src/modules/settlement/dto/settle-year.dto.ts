import { IsNumber, IsString } from 'class-validator'

export class SettleYearDto {
  @IsNumber()
  site_id: number

  @IsString()
  lottery_type: string

  @IsNumber()
  year: number
}
