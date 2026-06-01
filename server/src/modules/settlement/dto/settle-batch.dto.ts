import { IsNumber, IsString } from 'class-validator'

export class SettleBatchDto {
  @IsString()
  lottery_type: string

  @IsNumber()
  year: number
}
