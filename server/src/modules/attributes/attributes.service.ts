import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AttributeQueryDto } from './dto/attribute-query.dto'

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: AttributeQueryDto): Promise<any[]> {
    return []
  }

  async findOne(id: bigint): Promise<any> {
    return null
  }
}
