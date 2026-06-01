import { http } from './index'

export const generatorApi = {
  generateSite: (site_id: number) =>
                  http.post<any, any>('/generator/site', { site_id }),
  generatePlay: (site_id: number, play_id: number) =>
                  http.post<any, any>('/generator/play', { site_id, play_id }),
  generateYear: (dto: { site_id: number; lottery_type: string; year: number }) =>
                  http.post<any, any>('/generator/year', dto),
  rebuild:      (dto: { site_id: number; lottery_type: string; year?: number }) =>
                  http.post<any, any>('/generator/rebuild', dto),
}
