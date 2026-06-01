import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { LayoutsService } from './layouts.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('布局')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  findAll() {
    return this.layoutsService.findAll()
  }
}
