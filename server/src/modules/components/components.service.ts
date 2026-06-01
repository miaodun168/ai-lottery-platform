import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateComponentDto } from './dto/create-component.dto'

@Injectable()
export class ComponentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return []
  }

  async create(dto: CreateComponentDto): Promise<any> {
    return null
  }
}
