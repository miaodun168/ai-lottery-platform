import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AdsService } from './ads.service'
import { CreateAdDto } from './dto/create-ad.dto'
import { AiGenerateAdDto } from './dto/ai-generate-ad.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('广告')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  findAll() {
    return this.adsService.findAll()
  }

  @Post()
  create(@Body() dto: CreateAdDto) {
    return this.adsService.create(dto)
  }

  @Post('ai-generate')
  aiGenerate(@Body() dto: AiGenerateAdDto) {
    return this.adsService.aiGenerate(dto)
  }
}
