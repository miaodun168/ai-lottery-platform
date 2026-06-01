import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sitesApi, type Site, type CreateSiteDto, type DashboardStats } from '@/api/sites'
import { useMessage } from 'naive-ui'

export const useSitesStore = defineStore('sites', () => {
  const list      = ref<Site[]>([])
  const current   = ref<Site | null>(null)
  const dashboard = ref<DashboardStats | null>(null)
  const loading   = ref(false)

  async function fetchDashboard() {
    dashboard.value = await sitesApi.dashboard()
  }

  async function fetchList() {
    loading.value = true
    try { list.value = await sitesApi.list() }
    finally { loading.value = false }
  }

  async function fetchOne(id: string) {
    current.value = await sitesApi.get(id)
  }

  async function create(dto: CreateSiteDto) {
    const site = await sitesApi.create(dto)
    list.value.unshift(site)
    return site
  }

  async function update(id: string, dto: Partial<CreateSiteDto>) {
    const site = await sitesApi.update(id, dto)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx >= 0) list.value[idx] = site
    return site
  }

  async function remove(id: string) {
    await sitesApi.remove(id)
    list.value = list.value.filter(s => s.id !== id)
  }

  async function publish(id: string) {
    const site = await sitesApi.publish(id)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx >= 0) list.value[idx] = site
  }

  async function suspend(id: string) {
    const site = await sitesApi.suspend(id)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx >= 0) list.value[idx] = site
  }

  return { list, current, dashboard, loading, fetchDashboard, fetchList, fetchOne, create, update, remove, publish, suspend }
})
