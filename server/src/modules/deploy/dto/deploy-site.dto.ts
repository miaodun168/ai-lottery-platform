import { IsNumber } from 'class-validator'

export class DeploySiteDto {
  @IsNumber()
  site_id: number
}
