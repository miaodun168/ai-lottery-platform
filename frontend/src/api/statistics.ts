import { http } from './index'

export const statisticsApi = {
  get:         (params: { play_id?: string; site_id?: string; lottery_type?: string }) =>
                 http.get<any, any>('/statistics', { params }),
  ranking:     (lottery_type?: string) =>
                 http.get<any, any[]>('/statistics/ranking', { params: { lottery_type } }),
  hot:         () => http.get<any, any[]>('/statistics/hot'),
  trend:       (params: { play_id?: string; lottery_type?: string }) =>
                 http.get<any, any[]>('/statistics/trend', { params }),
  yearSummary: (year: number, lottery_type?: string) =>
                 http.get<any, any>('/statistics/year', { params: { year, lottery_type } }),
  rebuildAll:  (lottery_type?: string) =>
                 http.post<any, any>('/statistics/rebuild-all', null, { params: { lottery_type } }),
}
