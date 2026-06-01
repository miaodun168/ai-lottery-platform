import { IsOptional, IsString } from 'class-validator'

export class AttributeQueryDto {
  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  year?: string
}
