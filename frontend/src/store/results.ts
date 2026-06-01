import { defineStore } from 'pinia'
import { ref } from 'vue'
import { resultsApi, type LotteryResult, type CreateResultDto } from '@/api/results'

export const useResultsStore = defineStore('results', () => {
  const list    = ref<LotteryResult[]>([])
  const loading = ref(false)

  async function fetchList(params?: { lottery_type?: string; year?: string }) {
    loading.value = true
    try { list.value = await resultsApi.list(params) }
    finally { loading.value = false }
  }

  async function create(dto: CreateResultDto) {
    const result = await resultsApi.create(dto)
    list.value.unshift(result)
    return result
  }

  async function update(id: string, numbers: number[]) {
    const result = await resultsApi.update(id, { numbers })
    const idx = list.value.findIndex(r => r.id === id)
    if (idx >= 0) list.value[idx] = result
    return result
  }

  return { list, loading, fetchList, create, update }
})
