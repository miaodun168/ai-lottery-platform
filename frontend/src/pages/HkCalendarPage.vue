<template>
  <div>
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex justify-between items-center">
        <n-space>
          <span class="text-gray-600 font-medium">香港开奖日历</span>
          <n-select
            v-model:value="year"
            :options="yearOptions"
            style="width: 110px"
            @update:value="reload"
          />
        </n-space>
        <n-space>
          <n-button type="default" @click="showImport = true">
            <template #icon><n-icon><CloudUploadOutline /></n-icon></template>
            导入日历
          </n-button>
        </n-space>
      </div>
    </n-card>

    <n-card :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="calendarData"
        :loading="loading"
        :pagination="{ pageSize: 20 }"
        striped
        size="small"
      />
    </n-card>

    <!-- Import Modal -->
    <n-modal v-model:show="showImport" title="导入日历数据" preset="card" style="width: 500px">
      <n-alert type="info" title="日历格式说明" class="mb-4">
        每行一条：期号,开奖日期,开奖时间<br>
        例如：2026001,2026-01-03,21:30
      </n-alert>
      <n-input
        v-model:value="importText"
        type="textarea"
        placeholder="粘贴日历数据..."
        :autosize="{ minRows: 8, maxRows: 16 }"
      />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImport = false">取消</n-button>
          <n-button type="primary" :loading="importing" @click="handleImport">导入</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard, NSpace, NButton, NIcon, NDataTable, NModal, NInput, NSelect,
  NAlert, NTag, useMessage, type DataTableColumns,
} from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'
import { hkCalendarApi, type HkCalendar } from '@/api/hk-calendar'

const message  = useMessage()
const loading  = ref(false)
const importing = ref(false)
const showImport = ref(false)
const importText = ref('')
const calendarData = ref<HkCalendar[]>([])

const year = ref(new Date().getFullYear())
const yearOptions = computed(() => {
  const now = new Date().getFullYear()
  return [now + 1, now, now - 1].map(y => ({ label: String(y), value: y }))
})

const columns: DataTableColumns<HkCalendar> = [
  { title: '期号',    key: 'period',    width: 100 },
  { title: '开奖日期', key: 'draw_date', width: 130, render: r => r.draw_date?.slice(0, 10) ?? '' },
  { title: '开奖时间', key: 'draw_time', width: 100 },
  { title: '周次',    key: 'week_no',   width: 70 },
  {
    title: '节假日', key: 'is_holiday', width: 80,
    render: r => r.is_holiday ? h(NTag, { type: 'warning', size: 'small' }, () => '节假日') : '-',
  },
  {
    title: '状态', key: 'status', width: 80,
    render: r => h(NTag, { type: r.status === 'active' ? 'success' : 'default', size: 'small', round: true }, () => r.status),
  },
]

async function reload() {
  loading.value = true
  try { calendarData.value = await hkCalendarApi.list({ year: year.value }) }
  catch (e: any) { message.error(e?.message ?? '加载失败') }
  finally { loading.value = false }
}

async function handleImport() {
  if (!importText.value.trim()) { message.warning('请粘贴日历数据'); return }
  importing.value = true
  try {
    const lines = importText.value.trim().split('\n').filter(Boolean)
    const data = lines.map(line => {
      const [period, draw_date, draw_time] = line.split(',').map(s => s.trim())
      return { period, draw_date, draw_time, year: year.value, week_no: 0, is_holiday: false, status: 'active' } as any
    })
    await hkCalendarApi.import({ year: year.value, data })
    message.success(`导入 ${data.length} 条日历记录`)
    showImport.value = false
    importText.value = ''
    await reload()
  } catch (e: any) {
    message.error(e?.message ?? '导入失败')
  } finally {
    importing.value = false
  }
}

onMounted(() => reload())
</script>
