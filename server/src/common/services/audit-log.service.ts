import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId:     bigint | null,
    action:     string,
    targetType: string,
    targetId?:  bigint | null,
    detail?:    Record<string, any>,
  ) {
    await this.prisma.operationLog.create({
      data: {
        user_id:     userId,
        action,
        target_type: targetType,
        target_id:   targetId ?? null,
        detail_json: detail ?? {},
        created_at:  new Date(),
      },
    })
  }
}
