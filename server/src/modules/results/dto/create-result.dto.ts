import { IsArray, IsNumber, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator'

export class CreateResultDto {
  @IsString()
  lottery_type: string

  @IsString()
  period: string

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  numbers: number[]
}
