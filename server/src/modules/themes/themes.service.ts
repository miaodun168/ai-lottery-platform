import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return []
  }
}
