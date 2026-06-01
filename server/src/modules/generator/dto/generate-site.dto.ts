import { IsNumber } from 'class-validator'

export class GenerateSiteDto {
  @IsNumber()
  site_id: number
}
