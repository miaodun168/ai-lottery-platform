import { http } from './index'

export interface AiCommandDto {
  command: string; site_id?: string; user_id?: string
  mode?: 'auto' | 'preview'; confirmed?: boolean
}

export interface AiCommandResponse {
  task_id: string; status: string; message: string
  preview?: string[]; result?: any; dsls?: any[]
  requires_confirmation?: boolean
}

export interface AiTask {
  id: string; task_type: string; command_text: string
  status: string; created_at: string; finished_at?: string
  logs?: Array<{ step: number; action: string; status: string; message: string; duration_ms: number }>
}

export interface CommandLog {
  id: string; command: string; intent: string; status: string; created_at: string
}

export const aiApi = {
  command:     (dto: AiCommandDto) => http.post<any, AiCommandResponse>('/ai/command', dto),
  preview:     (dto: AiCommandDto) => http.post<any, AiCommandResponse>('/ai/preview', dto),
  getTasks:    (params?: { page?: number; limit?: number }) =>
                 http.get<any, { total: number; items: AiTask[] }>('/ai/tasks', { params }),
  getTask:     (id: string) => http.get<any, AiTask>(`/ai/tasks/${id}`),
  getLogs:     (params?: { site_id?: string; page?: number; limit?: number }) =>
                 http.get<any, { total: number; items: CommandLog[] }>('/ai/command-logs', { params }),
}
