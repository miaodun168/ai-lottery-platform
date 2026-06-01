import { IsNumber } from 'class-validator'

export class ApplyThemeDto {
  @IsNumber()
  theme_id: number
}
