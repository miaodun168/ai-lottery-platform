import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AdminUsersService } from './admin-users.service'
import { CreateAdminUserDto } from './dto/create-admin-user.dto'
import { UpdateAdminUserDto } from './dto/update-admin-user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SuperAdmin')
@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: '用户列表' })
  findAll() {
    return this.adminUsersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(BigInt(id))
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  create(@Body() dto: CreateAdminUserDto, @CurrentUser() user: JwtUser) {
    return this.adminUsersService.create(dto, user.id)
  }

  @Put(':id')
  @ApiOperation({ summary: '修改用户' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto, @CurrentUser() user: JwtUser) {
    return this.adminUsersService.update(BigInt(id), dto, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '禁用用户' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.adminUsersService.remove(BigInt(id), user.id)
  }
}
