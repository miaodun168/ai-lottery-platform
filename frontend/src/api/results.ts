import { http } from './index'

export interface LotteryResult {
  id: string; lottery_type: string; period: string
  draw_date: string; status: string
  numbers?: Array<{ seq_no: number; number: number; zodiac: string; wave: string; element: string; is_special: boolean }>
}

export interface CreateResultDto {
  lottery_type: string; period: string; numbers: number[]
}

export const resultsApi = {
  list:   (params?: { lottery_type?: string; year?: string }) =>
            http.get<any, LotteryResult[]>('/results', { params }),
  get:    (id: string)  => http.get<any, LotteryResult>(`/results/${id}`),
  create: (dto: CreateResultDto) => http.post<any, LotteryResult>('/results', dto),
  update: (id: string, dto: { numbers: number[] }) => http.put<any, LotteryResult>(`/results/${id}`, dto),
}
