import { IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateCalendarDto {
  @IsOptional()
  @IsString()
  draw_date?: string

  @IsOptional()
  @IsString()
  draw_time?: string

  @IsOptional()
  @IsIn(['pending', 'drawing', 'completed', 'cancelled'])
  status?: string
}
