import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PredictionBatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return []
  }

  async findOne(id: bigint): Promise<any> {
    return null
  }

  async rollback(id: bigint): Promise<any> {
    return null
  }
}
