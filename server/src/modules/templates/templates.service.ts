import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateTemplateDto } from './dto/create-template.dto'
import { UpdateTemplateDto } from './dto/update-template.dto'

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string): Promise<any[]> {
    return []
  }

  async create(dto: CreateTemplateDto): Promise<any> {
    return null
  }

  async update(id: bigint, dto: UpdateTemplateDto): Promise<any> {
    return null
  }
}
