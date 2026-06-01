import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ComponentsService } from './components.service'
import { CreateComponentDto } from './dto/create-component.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('组件')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get()
  findAll() {
    return this.componentsService.findAll()
  }

  @Post()
  create(@Body() dto: CreateComponentDto) {
    return this.componentsService.create(dto)
  }
}
