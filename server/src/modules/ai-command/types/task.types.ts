export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'rollback' | 'awaiting_confirm'

export interface AiTaskRecord {
  id:           bigint
  task_type:    string
  command_text: string
  status:       TaskStatus
  result_json:  any
  created_at:   Date
  finished_at?: Date
}

export interface TaskLogStep {
  task_id:     bigint
  step:        number
  action:      string
  status:      'running' | 'success' | 'failed'
  message?:    string
  data_before?: any
  data_after?:  any
  duration_ms?: number
}
