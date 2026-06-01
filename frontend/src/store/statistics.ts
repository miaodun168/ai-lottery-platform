import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statisticsApi } from '@/api/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
  const ranking    = ref<any[]>([])
  const hot        = ref<any[]>([])
  const yearSummary = ref<any>(null)
  const loading    = ref(false)

  async function fetchRanking(lottery_type?: string) {
    loading.value = true
    try { ranking.value = await statisticsApi.ranking(lottery_type) }
    finally { loading.value = false }
  }

  async function fetchHot() {
    hot.value = await statisticsApi.hot()
  }

  async function fetchYearSummary(year: number, lottery_type?: string) {
    yearSummary.value = await statisticsApi.yearSummary(year, lottery_type)
  }

  async function rebuildAll(lottery_type?: string) {
    return statisticsApi.rebuildAll(lottery_type)
  }

  return { ranking, hot, yearSummary, loading, fetchRanking, fetchHot, fetchYearSummary, rebuildAll }
})
