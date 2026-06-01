import { http } from './index'

export interface HkCalendar {
  id: string; period: string; draw_date: string; draw_time: string
  year: number; week_no: number; is_holiday: boolean; status: string
}

export interface ImportCalendarDto { year: number; data: HkCalendar[] }

export const hkCalendarApi = {
  list:   (params?: { year?: number }) =>
            http.get<any, HkCalendar[]>('/hk-calendar', { params }),
  import: (dto: ImportCalendarDto) => http.post<any, any>('/hk-calendar/import', dto),
  update: (id: string, dto: Partial<HkCalendar>) => http.put<any, HkCalendar>(`/hk-calendar/${id}`, dto),
  remove: (id: string) => http.delete<any, void>(`/hk-calendar/${id}`),
}
