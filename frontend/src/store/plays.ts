import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playsApi, type Play, type CreatePlayDto, type PlayRule } from '@/api/plays'

export const usePlaysStore = defineStore('plays', () => {
  const list    = ref<Play[]>([])
  const rules   = ref<PlayRule[]>([])
  const loading = ref(false)

  async function fetchRules() {
    rules.value = await playsApi.rules()
  }

  async function fetchList(params?: { site_id?: string; lottery_type?: string; status?: string }) {
    loading.value = true
    try { list.value = await playsApi.list(params) }
    finally { loading.value = false }
  }

  async function create(dto: CreatePlayDto) {
    const play = await playsApi.create(dto)
    list.value.unshift(play)
    return play
  }

  async function update(id: string, dto: Partial<CreatePlayDto>) {
    const play = await playsApi.update(id, dto)
    const idx = list.value.findIndex(p => p.id === id)
    if (idx >= 0) list.value[idx] = play
    return play
  }

  async function remove(id: string) {
    await playsApi.remove(id)
    list.value = list.value.filter(p => p.id !== id)
  }

  async function disable(id: string) {
    const play = await playsApi.disable(id)
    const idx = list.value.findIndex(p => p.id === id)
    if (idx >= 0) list.value[idx] = play
  }

  async function enable(id: string) {
    const play = await playsApi.enable(id)
    const idx = list.value.findIndex(p => p.id === id)
    if (idx >= 0) list.value[idx] = play
  }

  return { list, rules, loading, fetchRules, fetchList, create, update, remove, disable, enable }
})
