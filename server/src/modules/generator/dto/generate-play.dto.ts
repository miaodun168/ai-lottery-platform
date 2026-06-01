import { IsNumber } from 'class-validator'

export class GeneratePlayDto {
  @IsNumber()
  site_id: number

  @IsNumber()
  play_id: number
}
