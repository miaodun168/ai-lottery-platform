import { IsIn, IsString, MinLength } from 'class-validator'

export class CreateAdminUserDto {
  @IsString()
  username: string

  @IsString()
  @MinLength(8)
  password: string

  @IsIn(['SuperAdmin', 'Admin', 'Editor', 'Operator', 'Viewer'])
  role: string
}
