import { CommandDsl } from '../types/dsl.types'
import { ExecutionResult } from '../types/dsl.types'

export interface IExecutor {
  domains: string[]
  execute(dsl: CommandDsl, taskId: bigint): Promise<ExecutionResult>
}
