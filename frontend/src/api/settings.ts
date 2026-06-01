import { http } from './index'

export const settingsApi = {
  get:    () => http.get<any, Record<string, any>>('/settings'),
  update: (data: Record<string, any>) => http.put<any, any>('/settings', data),
}
