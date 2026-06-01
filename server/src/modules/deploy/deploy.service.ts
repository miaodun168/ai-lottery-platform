import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { DeploySiteDto } from './dto/deploy-site.dto'

@Injectable()
export class DeployService {
  constructor(private prisma: PrismaService) {}

  async deploySite(dto: DeploySiteDto): Promise<any> {
    return null
  }

  async getStatus(): Promise<any> {
    return null
  }

  async getDomain(): Promise<any> {
    return null
  }
}
