import { http } from './index'

const base = (siteId: string, pageType: string) =>
  `/admin/sites/${siteId}/pages/${pageType}`

export const pageEditorApi = {
  init:       (siteId: string, pageType: string, dto: any) =>
                http.post<any, any>(`${base(siteId, pageType)}/init`, dto),
  components: (siteId: string, pageType: string) =>
                http.get<any, any[]>(`${base(siteId, pageType)}/components`),
  addComponent:(siteId: string, pageType: string, dto: any) =>
                http.post<any, any>(`${base(siteId, pageType)}/components`, dto),
  removeComponent:(siteId: string, pageType: string, cid: string) =>
                http.delete<any, void>(`${base(siteId, pageType)}/components/${cid}`),
  updateComponent:(siteId: string, pageType: string, cid: string, dto: any) =>
                http.patch<any, any>(`${base(siteId, pageType)}/components/${cid}`, dto),
  sortComponents:(siteId: string, pageType: string, dto: { ids: string[] }) =>
                http.post<any, any>(`${base(siteId, pageType)}/components/sort`, dto),
  updateLayout:(siteId: string, pageType: string, dto: any) =>
                http.put<any, any>(`${base(siteId, pageType)}/layout`, dto),
  getDsl:     (siteId: string, pageType: string) =>
                http.get<any, any>(`${base(siteId, pageType)}/dsl`),
  saveDsl:    (siteId: string, pageType: string, dto: any) =>
                http.post<any, any>(`${base(siteId, pageType)}/dsl/save`, dto),
}
