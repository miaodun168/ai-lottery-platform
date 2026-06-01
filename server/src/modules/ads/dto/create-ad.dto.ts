import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateAdDto {
  @IsNumber()
  site_id: number

  @IsString()
  title: string

  @IsOptional()
  @IsString()
  image_url?: string

  @IsOptional()
  @IsString()
  target_url?: string

  @IsOptional()
  @IsNumber()
  sort_no?: number

  @IsOptional()
  @IsBoolean()
  status?: boolean
}
