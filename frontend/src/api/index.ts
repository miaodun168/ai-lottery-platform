import axios, { type AxiosResponse } from 'axios'

export const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request: attach JWT ──────────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response: unwrap data / redirect on 401 ─────────────────────────────────
http.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data ?? err)
  },
)

export type ApiResponse<T = any> = {
  data: T
  message?: string
  statusCode?: number
}
