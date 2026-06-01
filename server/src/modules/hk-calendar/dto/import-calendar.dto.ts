import { IsIn, IsOptional, IsString } from 'class-validator'

export class ImportCalendarDto {
  @IsOptional()
  @IsIn(['append', 'replace'])
  mode?: 'append' | 'replace'
}
