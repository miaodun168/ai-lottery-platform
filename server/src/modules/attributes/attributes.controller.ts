import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AttributesService } from './attributes.service'
import { AttributeQueryDto } from './dto/attribute-query.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('属性')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  findAll(@Query() query: AttributeQueryDto) {
    return this.attributesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(BigInt(id))
  }
}
