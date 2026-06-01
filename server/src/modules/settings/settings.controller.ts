import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('系统配置')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('Viewer')
  @ApiOperation({ summary: '获取所有系统配置' })
  getAll() {
    return this.settingsService.getAll()
  }

  @Put()
  @Roles('Admin')
  @ApiOperation({ summary: '更新系统配置' })
  update(@Body() dto: UpdateSettingsDto, @CurrentUser() user: JwtUser) {
    return this.settingsService.update(dto, user.id)
  }
}
