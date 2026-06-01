import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DeployService } from './deploy.service'
import { DeploySiteDto } from './dto/deploy-site.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('部署')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('Admin', 'SuperAdmin')
@Controller('deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post('site')
  deploySite(@Body() dto: DeploySiteDto) {
    return this.deployService.deploySite(dto)
  }

  @Get('status')
  getStatus() {
    return this.deployService.getStatus()
  }

  @Get('domain')
  getDomain() {
    return this.deployService.getDomain()
  }
}
