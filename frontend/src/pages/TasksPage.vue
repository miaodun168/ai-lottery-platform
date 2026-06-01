<template>
  <div>
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex justify-between items-center">
        <span class="font-medium text-gray-700">AI 任务中心</span>
        <n-button size="small" @click="reload">刷新</n-button>
      </div>
    </n-card>

    <n-card :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="aiStore.tasks"
        :pagination="{ pageSize: 20, itemCount: aiStore.taskTotal, onChange: handlePageChange }"
        :loading="loading"
        striped
      />
    </n-card>

    <!-- Task detail drawer -->
    <n-drawer v-model:show="showDetail" :width="520" placement="right">
      <n-drawer-content :title="`任务详情 #${selectedTask?.id}`" closable>
        <div v-if="selectedTask">
          <n-descriptions :column="2" label-placement="left" bordered class="mb-4">
            <n-descriptions-item label="任务类型">{{ selectedTask.task_type }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag :type="tagType(selectedTask.status)" size="small" round>{{ selectedTask.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="创建时间">{{ selectedTask.created_at?.slice(0,19) }}</n-descriptions-item>
            <n-descriptions-item label="完成时间">{{ selectedTask.finished_at?.slice(0,19) ?? '-' }}</n-descriptions-item>
            <n-descriptions-item label="命令" :span="2">{{ selectedTask.command_text }}</n-descriptions-item>
          </n-descriptions>

          <div class="font-medium text-sm mb-2">执行步骤：</div>
          <n-timeline v-if="selectedTask.logs?.length">
            <n-timeline-item
              v-for="log in selectedTask.logs"
              :key="log.step"
              :type="stepType(log.status)"
              :title="`步骤 ${log.step}: ${log.action}`"
              :content="log.message"
              :time="log.duration_ms ? `${log.duration_ms}ms` : ''"
            />
          </n-timeline>
          <n-empty v-else description="暂无执行日志" />
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NTag, NDrawer, NDrawerContent,
  NDescriptions, NDescriptionsItem, NTimeline, NTimelineItem, NEmpty,
  useMessage, type DataTableColumns,
} from 'naive-ui'
import { useAiStore } from '@/store/ai'
import type { AiTask } from '@/api/ai'

const aiStore     = useAiStore()
const message     = useMessage()
const loading     = ref(false)
const showDetail  = ref(false)
const selectedTask = ref<AiTask | null>(null)
const currentPage = ref(1)

function tagType(status: string) {
  const m: Record<string, any> = { success: 'success', failed: 'error', running: 'warning', pending: 'default' }
  return m[status] ?? 'default'
}

function stepType(status: string) {
  return status === 'success' ? 'success' : status === 'failed' ? 'error' : 'default'
}

const columns: DataTableColumns<AiTask> = [
  { title: 'ID',    key: 'id',           width: 80 },
  { title: '命令',  key: 'command_text', ellipsis: true },
  { title: '类型',  key: 'task_type',    width: 160 },
  {
    title: '状态', key: 'status', width: 100,
    render: r => h(NTag, { type: tagType(r.status), size: 'small', round: true }, () => r.status),
  },
  { title: '创建时间', key: 'created_at', width: 180, render: r => r.created_at?.slice(0,19) ?? '' },
  {
    title: '操作', key: 'actions', width: 80,
    render: r => h(NButton, { size: 'small', onClick: () => viewTask(r) }, () => '详情'),
  },
]

async function viewTask(task: AiTask) {
  try {
    selectedTask.value = await aiStore.fetchTask(task.id)
    showDetail.value = true
  } catch (e: any) {
    message.error('加载任务详情失败')
  }
}

async function reload() {
  loading.value = true
  try { await aiStore.fetchTasks({ page: currentPage.value, limit: 20 }) }
  finally { loading.value = false }
}

async function handlePageChange(page: number) {
  currentPage.value = page
  await reload()
}

onMounted(() => reload())
</script>
