import { IsString } from 'class-validator'

export class SettlePeriodDto {
  @IsString()
  lottery_type: string

  @IsString()
  period: string
}
