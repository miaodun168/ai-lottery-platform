import { IsArray, IsNumber, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator'

export class UpdateResultDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  numbers?: number[]
}
