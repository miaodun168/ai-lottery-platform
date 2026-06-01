<template>
  <div>
    <!-- Controls -->
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex items-center justify-between">
        <n-space>
          <n-select
            v-model:value="lotteryType"
            :options="lotteryOptions"
            style="width:120px"
            @update:value="reload"
          />
          <n-select
            v-model:value="year"
            :options="yearOptions"
            style="width:110px"
            @update:value="loadYearSummary"
          />
        </n-space>
        <n-button type="warning" :loading="rebuilding" @click="handleRebuild">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          全量重算
        </n-button>
      </div>
    </n-card>

    <!-- Year summary cards -->
    <n-grid :cols="4" :x-gap="16" class="mb-4" v-if="statsStore.yearSummary">
      <n-grid-item v-for="card in summaryCards" :key="card.label">
        <n-card :bordered="false" class="shadow-sm">
          <n-statistic :label="card.label" :value="card.value" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Ranking table -->
    <n-card title="命中率排行榜" :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="statsStore.ranking"
        :loading="statsStore.loading"
        :pagination="{ pageSize: 20 }"
        striped
        size="small"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { NCard, NGrid, NGridItem, NStatistic, NDataTable, NSelect, NButton, NIcon, NSpace, NProgress, useMessage, type DataTableColumns } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import { useStatisticsStore } from '@/store/statistics'

const statsStore = useStatisticsStore()
const message    = useMessage()

const lotteryType = ref('hk')
const year        = ref(new Date().getFullYear())
const rebuilding  = ref(false)

const lotteryOptions = [{ label: '香港', value: 'hk' }, { label: '澳门', value: 'mo' }]
const yearOptions    = computed(() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(y => ({ label: String(y), value: y }))
})

const summaryCards = computed(() => {
  const s = statsStore.yearSummary
  if (!s) return []
  return [
    { label: '总期数',  value: s.total_count },
    { label: '总命中',  value: s.hit_count },
    { label: '总失败',  value: s.miss_count },
    { label: '总命中率', value: `${s.rate ?? 0}%` },
  ]
})

const columns: DataTableColumns<any> = [
  { title: '排名',     key: 'rank',        width: 70,  align: 'center' },
  { title: '玩法ID',  key: 'play_id',     width: 90 },
  { title: '采种',    key: 'lottery_type', width: 80 },
  {
    title: '命中率', key: 'hit_rate', width: 120,
    render: r => h('div', { class: 'flex items-center gap-2' }, [
      h('span', {}, `${r.hit_rate ?? 0}%`),
      h(NProgress, { type: 'line', percentage: r.hit_rate ?? 0, showIndicator: false, height: 6, color: hitRateColor(r.hit_rate) }),
    ]),
    sorter: (a: any, b: any) => (a.hit_rate ?? 0) - (b.hit_rate ?? 0),
  },
  { title: '总期数', key: 'total_count', width: 90, sorter: (a: any, b: any) => a.total_count - b.total_count },
  { title: '命中数', key: 'hit_count',   width: 90 },
]

function hitRateColor(rate: number) {
  if (rate >= 80) return '#18a058'
  if (rate >= 60) return '#f0a020'
  return '#d03050'
}

async function reload() {
  await Promise.all([
    statsStore.fetchRanking(lotteryType.value),
    loadYearSummary(),
  ])
}

async function loadYearSummary() {
  await statsStore.fetchYearSummary(year.value, lotteryType.value)
}

async function handleRebuild() {
  rebuilding.value = true
  try {
    const res = await statsStore.rebuildAll(lotteryType.value)
    message.success(res.message ?? '重算完成')
    await reload()
  } catch (e: any) {
    message.error(e?.message ?? '重算失败')
  } finally {
    rebuilding.value = false
  }
}

onMounted(() => reload())
</script>
