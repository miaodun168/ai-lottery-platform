import { IsNumber } from 'class-validator'

export class ApplyLayoutDto {
  @IsNumber()
  layout_id: number
}
