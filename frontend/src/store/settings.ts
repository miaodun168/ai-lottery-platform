import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/api/settings'

export const useSettingsStore = defineStore('settings', () => {
  const data    = ref<Record<string, any>>({})
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try { data.value = await settingsApi.get() }
    finally { loading.value = false }
  }

  async function save(updates: Record<string, any>) {
    await settingsApi.update(updates)
    Object.assign(data.value, updates)
  }

  return { data, loading, fetch, save }
})
