import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SitesService } from './sites.service'
import { CreateSiteDto } from './dto/create-site.dto'
import { ApplyThemeDto } from './dto/apply-theme.dto'
import { ApplyLayoutDto } from './dto/apply-layout.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('站点管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get('dashboard')
  @Roles('Viewer')
  @ApiOperation({ summary: '控制台统计' })
  getDashboardStats() {
    return this.sitesService.getDashboardStats()
  }

  @Get()
  @Roles('Viewer')
  @ApiOperation({ summary: '站点列表' })
  findAll() {
    return this.sitesService.findAll()
  }

  @Get(':id')
  @Roles('Viewer')
  @ApiOperation({ summary: '站点详情' })
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(BigInt(id))
  }

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: '创建站点' })
  create(@Body() dto: CreateSiteDto, @CurrentUser() user: JwtUser) {
    return this.sitesService.create(dto, user.id)
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '修改站点' })
  update(@Param('id') id: string, @Body() dto: CreateSiteDto, @CurrentUser() user: JwtUser) {
    return this.sitesService.update(BigInt(id), dto, user.id)
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '删除站点' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.sitesService.remove(BigInt(id), user.id)
  }

  @Post(':id/publish')
  @Roles('Admin')
  @ApiOperation({ summary: '发布站点' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.sitesService.publish(BigInt(id), user.id)
  }

  @Post(':id/suspend')
  @Roles('Admin')
  @ApiOperation({ summary: '暂停站点' })
  suspend(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.sitesService.suspend(BigInt(id), user.id)
  }

  @Post(':id/theme')
  @Roles('Admin')
  @ApiOperation({ summary: '应用主题' })
  applyTheme(@Param('id') id: string, @Body() dto: ApplyThemeDto, @CurrentUser() user: JwtUser) {
    return this.sitesService.applyTheme(BigInt(id), dto, user.id)
  }

  @Post(':id/layout')
  @Roles('Admin')
  @ApiOperation({ summary: '应用布局' })
  applyLayout(@Param('id') id: string, @Body() dto: ApplyLayoutDto, @CurrentUser() user: JwtUser) {
    return this.sitesService.applyLayout(BigInt(id), dto, user.id)
  }
}
