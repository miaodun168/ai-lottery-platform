<template>
  <div>
    <n-grid :cols="12" :x-gap="16">
      <!-- Command input panel -->
      <n-grid-item :span="7">
        <n-card title="AI 命令中心" :bordered="false" class="shadow-sm">
          <template #header-extra>
            <n-select
              v-model:value="selectedSiteId"
              :options="siteOptions"
              placeholder="选择站点（可选）"
              clearable
              style="width: 180px"
            />
          </template>

          <n-input
            v-model:value="command"
            type="textarea"
            placeholder="输入自然语言命令，例如：&#10;创建一个红金风格香港站&#10;新增20个平特一肖&#10;把首页广告减少一半"
            :autosize="{ minRows: 4, maxRows: 8 }"
            class="mb-4"
          />

          <n-space class="mb-4">
            <n-radio-group v-model:value="mode">
              <n-radio value="preview">预览模式</n-radio>
              <n-radio value="auto">自动执行</n-radio>
            </n-radio-group>
          </n-space>

          <n-space>
            <n-button type="default" :disabled="!command" @click="handlePreview">
              <template #icon><n-icon><EyeOutline /></n-icon></template>
              预览解析
            </n-button>
            <n-button
              type="primary"
              :loading="aiStore.loading"
              :disabled="!command"
              @click="handleExecute"
            >
              <template #icon><n-icon><SendOutline /></n-icon></template>
              {{ mode === 'preview' ? '确认执行' : '立即执行' }}
            </n-button>
          </n-space>

          <!-- Result display -->
          <template v-if="result">
            <n-divider />
            <div class="space-y-3">
              <!-- Status -->
              <div class="flex items-center gap-2">
                <span class="text-gray-500 text-sm">执行状态：</span>
                <n-tag :type="resultTagType" round size="small">{{ result.status }}</n-tag>
                <span v-if="result.task_id && result.task_id !== '0'" class="text-xs text-gray-400">
                  Task #{{ result.task_id }}
                </span>
              </div>

              <!-- Message -->
              <n-alert :type="resultAlertType" :title="result.message" />

              <!-- Preview list -->
              <template v-if="result.preview?.length">
                <div class="text-sm font-medium text-gray-600 mb-1">操作预览：</div>
                <n-list bordered size="small">
                  <n-list-item v-for="(p, i) in result.preview" :key="i">
                    <n-icon color="#18a058" class="mr-2"><CheckmarkOutline /></n-icon>
                    {{ p }}
                  </n-list-item>
                </n-list>
              </template>

              <!-- Confirm button for risky/preview ops -->
              <n-button
                v-if="result.requires_confirmation || result.status === 'pending'"
                type="warning"
                :loading="aiStore.loading"
                @click="handleConfirm"
              >
                确认执行所有操作
              </n-button>
            </div>
          </template>
        </n-card>

        <!-- Quick commands -->
        <n-card title="常用命令" :bordered="false" class="shadow-sm mt-4">
          <n-space wrap>
            <n-button
              v-for="cmd in quickCommands"
              :key="cmd"
              size="small"
              @click="command = cmd"
            >{{ cmd }}</n-button>
          </n-space>
        </n-card>
      </n-grid-item>

      <!-- Task log panel -->
      <n-grid-item :span="5">
        <n-card title="最近任务" :bordered="false" class="shadow-sm" style="height: 100%">
          <template #header-extra>
            <n-button text size="small" @click="loadTasks">刷新</n-button>
          </template>
          <n-list style="max-height: 520px; overflow-y: auto;">
            <n-list-item v-for="task in aiStore.tasks" :key="task.id">
              <n-thing>
                <template #header>
                  <span class="text-sm font-medium truncate">{{ task.command_text }}</span>
                </template>
                <template #header-extra>
                  <n-tag :type="taskTagType(task.status)" size="small" round>{{ task.status }}</n-tag>
                </template>
                <template #description>
                  <span class="text-xs text-gray-400">{{ task.created_at?.slice(0, 19) }}</span>
                </template>
              </n-thing>
            </n-list-item>
            <n-empty v-if="!aiStore.tasks.length" description="暂无任务" />
          </n-list>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NGrid, NGridItem, NCard, NInput, NSpace, NButton, NIcon, NTag,
  NAlert, NList, NListItem, NThing, NSelect, NRadioGroup, NRadio,
  NDivider, NEmpty, useMessage,
} from 'naive-ui'
import { EyeOutline, SendOutline, CheckmarkOutline } from '@vicons/ionicons5'
import { useAiStore } from '@/store/ai'
import { useSitesStore } from '@/store/sites'
import type { AiCommandResponse } from '@/api/ai'

const aiStore    = useAiStore()
const sitesStore = useSitesStore()
const message    = useMessage()

const command        = ref('')
const mode           = ref<'preview' | 'auto'>('preview')
const selectedSiteId = ref<string | undefined>()
const result         = ref<AiCommandResponse | null>(null)

const siteOptions = computed(() =>
  sitesStore.list.map(s => ({ label: s.name, value: s.id }))
)

const resultTagType = computed(() => {
  if (!result.value) return 'default'
  const m: Record<string, any> = { success: 'success', failed: 'error', pending: 'warning', awaiting_confirm: 'warning', running: 'info' }
  return m[result.value.status] ?? 'default'
})

const resultAlertType = computed(() => {
  if (!result.value) return 'default'
  const m: Record<string, any> = { success: 'success', failed: 'error', pending: 'info', awaiting_confirm: 'warning' }
  return m[result.value.status] ?? 'default'
})

function taskTagType(status: string) {
  const m: Record<string, any> = { success: 'success', failed: 'error', running: 'warning', pending: 'default' }
  return m[status] ?? 'default'
}

async function handlePreview() {
  if (!command.value.trim()) return
  try {
    result.value = await aiStore.previewCommand({ command: command.value, site_id: selectedSiteId.value })
  } catch (e: any) {
    message.error(e?.message ?? '预览失败')
  }
}

async function handleExecute() {
  if (!command.value.trim()) return
  try {
    result.value = await aiStore.sendCommand({
      command:   command.value,
      site_id:   selectedSiteId.value,
      mode:      mode.value,
      confirmed: mode.value === 'auto',
    })
    if (result.value.status === 'success') {
      message.success('执行成功')
      loadTasks()
    }
  } catch (e: any) {
    message.error(e?.message ?? '执行失败')
  }
}

async function handleConfirm() {
  try {
    result.value = await aiStore.sendCommand({
      command:   command.value,
      site_id:   selectedSiteId.value,
      mode:      'auto',
      confirmed: true,
    })
    if (result.value.status === 'success') {
      message.success('执行成功')
      loadTasks()
    }
  } catch (e: any) {
    message.error(e?.message ?? '执行失败')
  }
}

async function loadTasks() {
  await aiStore.fetchTasks({ page: 1, limit: 20 })
}

const quickCommands = [
  '创建一个红金风格香港站',
  '新增20个平特一肖',
  '把首页广告减少一半',
  '切换红金主题',
  '批量新增20个绝杀玩法',
  '把开奖模块放到顶部',
  '重新计算统计',
  '刷新缓存',
]

onMounted(async () => {
  await Promise.all([sitesStore.fetchList(), loadTasks()])
})
</script>
