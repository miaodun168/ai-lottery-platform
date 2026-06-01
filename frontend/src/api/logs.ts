import { http } from './index'

export const logsApi = {
  list:   (params?: { page?: number; limit?: number }) =>
            http.get<any, any>('/logs', { params }),
  ai:     (params?: { page?: number; limit?: number }) =>
            http.get<any, any>('/logs/ai', { params }),
  result: (params?: { page?: number; limit?: number }) =>
            http.get<any, any>('/logs/result', { params }),
}
