import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateAdDto } from './dto/create-ad.dto'
import { AiGenerateAdDto } from './dto/ai-generate-ad.dto'

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return []
  }

  async create(dto: CreateAdDto): Promise<any> {
    return null
  }

  async aiGenerate(dto: AiGenerateAdDto): Promise<any> {
    return null
  }
}
