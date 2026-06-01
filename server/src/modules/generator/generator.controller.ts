import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { GeneratorService } from './generator.service'
import { GenerateYearDto } from './dto/generate-year.dto'
import { GeneratePlayDto } from './dto/generate-play.dto'
import { GenerateSiteDto } from './dto/generate-site.dto'
import { RebuildDto } from './dto/rebuild.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('数据生成')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('Admin', 'SuperAdmin')
@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('year')
  generateYear(@Body() dto: GenerateYearDto) {
    return this.generatorService.generateYear(dto)
  }

  @Post('play')
  generatePlay(@Body() dto: GeneratePlayDto) {
    return this.generatorService.generatePlay(dto)
  }

  @Post('site')
  generateSite(@Body() dto: GenerateSiteDto) {
    return this.generatorService.generateSite(dto)
  }

  @Post('rebuild')
  rebuild(@Body() dto: RebuildDto) {
    return this.generatorService.rebuild(dto)
  }
}
