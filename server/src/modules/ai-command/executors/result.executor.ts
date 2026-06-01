import { Injectable } from '@nestjs/common'
import { ResultsService } from '../../results/results.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { CommandDsl, ExecutionResult } from '../types/dsl.types'
import { IExecutor } from './executor.interface'

@Injectable()
export class ResultExecutor implements IExecutor {
  readonly domains = ['result']

  constructor(
    private resultsService: ResultsService,
    private prisma:         PrismaService,
  ) {}

  async execute(dsl: CommandDsl, _taskId: bigint): Promise<ExecutionResult> {
    const period      = dsl.params.period
    const numbers     = dsl.params.numbers as number[] | undefined
    const lotteryType = dsl.params.lottery_type ?? 'hk'
    const operatorId  = dsl.user_id ? BigInt(dsl.user_id) : undefined

    switch (dsl.intent) {
      case 'create_result': {
        if (!period) return this.err('缺少期号，例如：录入第2026120期开奖结果')
        if (!numbers || numbers.length !== 7) {
          return {
            success: false,
            message: `已识别期号 ${period}，请补充7个开奖号码（6个平码 + 1个特码）后执行`,
            data:    { period, lottery_type: lotteryType, requires_numbers: true },
          }
        }
        const result = await this.resultsService.create(
          { lottery_type: lotteryType, period, numbers },
          operatorId,
        )
        return this.ok(`第 ${period} 期开奖结果已录入，特码: ${numbers[6]}`, result)
      }

      case 'update_result': {
        if (!period) return this.err('缺少期号')
        if (!numbers || numbers.length !== 7) {
          return {
            success: false,
            message: `已识别期号 ${period}，请提供修正后的7个号码后执行`,
            data:    { period, lottery_type: lotteryType, requires_numbers: true },
          }
        }
        const existing = await this.prisma.result.findFirst({
          where: { lottery_type: lotteryType, period },
        })
        if (!existing) return this.err(`期号 ${period} 不存在`)
        const updated = await this.resultsService.update(existing.id, { numbers }, operatorId)
        return this.ok(`第 ${period} 期开奖结果已更新，特码: ${numbers[6]}`, updated)
      }

      case 'delete_result': {
        if (!period) return this.err('缺少期号')
        const existing = await this.prisma.result.findFirst({
          where: { lottery_type: lotteryType, period },
        })
        if (!existing) return this.err(`期号 ${period} 不存在`)
        await this.prisma.$transaction([
          this.prisma.resultAttribute.deleteMany({ where: { result_id: existing.id } }),
          this.prisma.resultNumber.deleteMany({ where: { result_id: existing.id } }),
          this.prisma.result.delete({ where: { id: existing.id } }),
        ])
        return this.ok(`第 ${period} 期开奖结果已删除`)
      }

      default:
        return this.err(`未知开奖操作: ${dsl.intent}`)
    }
  }

  private ok(message: string, data?: any): ExecutionResult { return { success: true, message, data } }
  private err(message: string): ExecutionResult { return { success: false, message } }
}
