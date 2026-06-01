import { http } from './index'

export interface Play {
  id: string; name: string; alias_name: string; rule_code: string
  lottery_type: string; status: string; sort_no: number; site_id: string
  hit_rate?: number; total_count?: number
}

export interface PlayRule { rule_code: string; rule_name: string; dsl: any }

export interface CreatePlayDto {
  site_id: number; lottery_type: string; rule_code: string; name: string
}

export const playsApi = {
  rules:      ()               => http.get<any, PlayRule[]>('/plays/rules'),
  list:       (params?: { site_id?: string; lottery_type?: string; status?: string }) =>
                http.get<any, Play[]>('/plays', { params }),
  get:        (id: string)     => http.get<any, Play>(`/plays/${id}`),
  create:     (dto: CreatePlayDto) => http.post<any, Play>('/plays', dto),
  update:     (id: string, dto: Partial<CreatePlayDto>) => http.put<any, Play>(`/plays/${id}`, dto),
  remove:     (id: string)     => http.delete<any, void>(`/plays/${id}`),
  disable:    (id: string)     => http.post<any, Play>(`/plays/${id}/disable`),
  enable:     (id: string)     => http.post<any, Play>(`/plays/${id}/enable`),
  regenerate: (id: string)     => http.post<any, any>(`/plays/${id}/regenerate`),
}
