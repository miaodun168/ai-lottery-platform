import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateAdminUserDto {
  @IsOptional()
  @IsIn(['SuperAdmin', 'Admin', 'Editor', 'Operator', 'Viewer'])
  role?: string

  @IsOptional()
  @IsBoolean()
  status?: boolean

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string
}
