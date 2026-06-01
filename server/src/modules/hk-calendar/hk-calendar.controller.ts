import {
  Body, Controller, Delete, Get, Param, Post, Put,
  Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger'
import { HkCalendarService } from './hk-calendar.service'
import { ImportCalendarDto } from './dto/import-calendar.dto'
import { UpdateCalendarDto } from './dto/update-calendar.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'

@ApiTags('香港开奖日历')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hk-calendar')
export class HkCalendarController {
  constructor(private readonly hkCalendarService: HkCalendarService) {}

  @Get()
  @Roles('Viewer')
  @ApiOperation({ summary: '开奖日历列表' })
  findAll(@Query('year') year?: string) {
    return this.hkCalendarService.findAll(year ? parseInt(year) : undefined)
  }

  @Post('import')
  @Roles('Admin')
  @ApiOperation({ summary: '导入开奖日历（CSV）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  import(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportCalendarDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.hkCalendarService.import(file, dto, user.id)
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '修改期号' })
  update(@Param('id') id: string, @Body() dto: UpdateCalendarDto, @CurrentUser() user: JwtUser) {
    return this.hkCalendarService.update(BigInt(id), dto, user.id)
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: '删除待开奖期号' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.hkCalendarService.remove(BigInt(id), user.id)
  }
}
