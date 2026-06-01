import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PlaysService } from './plays.service'
import { CreatePlayDto } from './dto/create-play.dto'
import { UpdatePlayDto } from './dto/update-play.dto'
import { PlaysQueryDto } from './dto/plays-query.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('玩法管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plays')
export class PlaysController {
  constructor(private readonly playsService: PlaysService) {}

  @Get('rules')
  @Roles('Viewer')
  @ApiOperation({ summary: '规则库列表' })
  getRules() {
    return this.playsService.getRules()
  }

  @Get()
  @Roles('Viewer')
  @ApiOperation({ summary: '玩法列表' })
  findAll(@Query() query: PlaysQueryDto) {
    return this.playsService.findAll(query)
  }

  @Get(':id')
  @Roles('Viewer')
  @ApiOperation({ summary: '玩法详情' })
  findOne(@Param('id') id: string) {
    return this.playsService.findOne(BigInt(id))
  }

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: '新增玩法' })
  create(@Body() dto: CreatePlayDto, @CurrentUser() user: JwtUser) {
    return this.playsService.create(dto, user.id)
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '修改玩法' })
  update(@Param('id') id: string, @Body() dto: UpdatePlayDto, @CurrentUser() user: JwtUser) {
    return this.playsService.update(BigInt(id), dto, user.id)
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '删除玩法' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.playsService.remove(BigInt(id), user.id)
  }

  @Post(':id/disable')
  @Roles('Admin')
  @ApiOperation({ summary: '停用玩法' })
  disable(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.playsService.setStatus(BigInt(id), 'disabled', user.id)
  }

  @Post(':id/enable')
  @Roles('Admin')
  @ApiOperation({ summary: '启用玩法' })
  enable(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.playsService.setStatus(BigInt(id), 'active', user.id)
  }

  @Post(':id/regenerate')
  @Roles('Admin')
  @ApiOperation({ summary: '重新生成预测数据' })
  regenerate(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.playsService.regenerate(BigInt(id), user.id)
  }
}
