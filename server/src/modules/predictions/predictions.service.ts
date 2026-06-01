import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PredictionQueryDto } from './dto/prediction-query.dto'
import { YearPredictionQueryDto } from './dto/year-prediction-query.dto'

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PredictionQueryDto): Promise<any[]> {
    return []
  }

  async findOne(id: bigint): Promise<any> {
    return null
  }

  async findByYear(query: YearPredictionQueryDto): Promise<any[]> {
    return []
  }
}
