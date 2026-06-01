import { IsNumber, IsString } from 'class-validator'

export class AiSiteUpdateDto {
  @IsNumber()
  site_id: number

  @IsString()
  instruction: string
}
