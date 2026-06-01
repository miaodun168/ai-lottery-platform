import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return []
  }

  async create(dto: CreatePageDto): Promise<any> {
    return null
  }

  async update(id: bigint, dto: UpdatePageDto): Promise<any> {
    return null
  }
}
