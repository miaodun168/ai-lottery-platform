<template>
  <div>
    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="mb-6">
      <n-grid-item v-for="card in statCards" :key="card.label">
        <n-card :bordered="false" class="shadow-sm">
          <n-statistic :label="card.label" :value="card.value ?? 0">
            <template #prefix>
              <n-icon :color="card.color" size="24"><component :is="card.icon" /></n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <!-- Recent AI tasks -->
      <n-grid-item>
        <n-card title="最近AI任务" :bordered="false" class="shadow-sm">
          <template #header-extra>
            <n-button text @click="router.push('/tasks')">查看全部</n-button>
          </template>
          <n-spin :show="aiStore.loading">
            <n-list>
              <n-list-item v-for="task in aiStore.tasks.slice(0, 5)" :key="task.id">
                <n-thing :title="task.command_text" :description="task.created_at">
                  <template #header-extra>
                    <n-tag :type="statusType(task.status)" size="small" round>{{ task.status }}</n-tag>
                  </template>
                </n-thing>
              </n-list-item>
              <n-empty v-if="!aiStore.tasks.length" description="暂无任务" />
            </n-list>
          </n-spin>
        </n-card>
      </n-grid-item>

      <!-- Site list quick view -->
      <n-grid-item>
        <n-card title="站点列表" :bordered="false" class="shadow-sm">
          <template #header-extra>
            <n-button text @click="router.push('/sites')">管理站点</n-button>
          </template>
          <n-spin :show="sitesStore.loading">
            <n-list>
              <n-list-item v-for="site in sitesStore.list.slice(0, 5)" :key="site.id">
                <n-thing :title="site.name" :description="site.domain ?? site.code">
                  <template #header-extra>
                    <n-tag :type="siteStatusType(site.status)" size="small" round>{{ site.status }}</n-tag>
                  </template>
                </n-thing>
              </n-list-item>
              <n-empty v-if="!sitesStore.list.length" description="暂无站点" />
            </n-list>
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid, NGridItem, NCard, NStatistic, NIcon, NSpin, NList, NListItem,
  NThing, NTag, NButton, NEmpty,
} from 'naive-ui'
import {
  BusinessOutline, ListOutline, TrophyOutline, MegaphoneOutline,
} from '@vicons/ionicons5'
import { useSitesStore } from '@/store/sites'
import { useAiStore } from '@/store/ai'

const router     = useRouter()
const sitesStore = useSitesStore()
const aiStore    = useAiStore()

const statCards = computed(() => [
  { label: '站点总数',  value: sitesStore.dashboard?.sites,   color: '#18a058', icon: BusinessOutline },
  { label: '玩法总数',  value: sitesStore.dashboard?.plays,   color: '#2080f0', icon: ListOutline },
  { label: '开奖总数',  value: sitesStore.dashboard?.results, color: '#f0a020', icon: TrophyOutline },
  { label: '广告总数',  value: sitesStore.dashboard?.ads,     color: '#d03050', icon: MegaphoneOutline },
])

function statusType(status: string) {
  return status === 'success' ? 'success' : status === 'failed' ? 'error' : status === 'running' ? 'warning' : 'default'
}

function siteStatusType(status: string) {
  return status === 'published' ? 'success' : status === 'disabled' ? 'error' : 'warning'
}

onMounted(async () => {
  await Promise.all([
    sitesStore.fetchDashboard(),
    sitesStore.fetchList(),
    aiStore.fetchTasks({ page: 1, limit: 5 }),
  ])
})
</script>
