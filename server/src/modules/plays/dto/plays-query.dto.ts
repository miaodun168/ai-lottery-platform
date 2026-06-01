import { IsOptional, IsString } from 'class-validator'

export class PlaysQueryDto {
  @IsOptional()
  @IsString()
  site_id?: string

  @IsOptional()
  @IsString()
  lottery_type?: string
}
