import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class LotteryService {
  constructor(private prisma: PrismaService) {}

  async getTypes(): Promise<any[]> {
    return []
  }
}
