import { http } from './index'

export interface Site {
  id: string; name: string; code: string; domain: string
  status: string; theme_id: number | null; layout_id: number | null
  created_at: string
}

export interface CreateSiteDto {
  name: string; domain?: string; lottery_types?: string[]
  theme?: string; layout?: string; play_count?: number; ad_count?: number
}

export interface DashboardStats {
  sites: number; plays: number; results: number; ads: number
}

export const sitesApi = {
  dashboard: ()               => http.get<any, DashboardStats>('/sites/dashboard'),
  list:      ()               => http.get<any, Site[]>('/sites'),
  get:       (id: string)     => http.get<any, Site>(`/sites/${id}`),
  create:    (dto: CreateSiteDto)          => http.post<any, Site>('/sites', dto),
  update:    (id: string, dto: Partial<CreateSiteDto>) => http.put<any, Site>(`/sites/${id}`, dto),
  remove:    (id: string)     => http.delete<any, void>(`/sites/${id}`),
  publish:   (id: string)     => http.post<any, Site>(`/sites/${id}/publish`),
  suspend:   (id: string)     => http.post<any, Site>(`/sites/${id}/suspend`),
  applyTheme:(id: string, theme_id: number) => http.post<any, Site>(`/sites/${id}/theme`, { theme_id }),
  applyLayout:(id: string, layout_id: number) => http.post<any, Site>(`/sites/${id}/layout`, { layout_id }),
}
