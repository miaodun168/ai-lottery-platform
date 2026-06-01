<template>
  <div>
    <!-- Site + Page selector -->
    <n-card :bordered="false" class="shadow-sm mb-4">
      <n-space>
        <n-select
          v-model:value="selectedSiteId"
          :options="siteOptions"
          placeholder="选择站点"
          style="width:180px"
          @update:value="onSiteChange"
        />
        <n-select
          v-model:value="selectedPageType"
          :options="pageTypes"
          placeholder="选择页面"
          style="width:150px"
          @update:value="loadComponents"
        />
        <n-button type="primary" :disabled="!selectedSiteId || !selectedPageType" @click="handleInit">
          初始化页面
        </n-button>
      </n-space>
    </n-card>

    <n-grid v-if="selectedSiteId && selectedPageType" :cols="12" :x-gap="16">
      <!-- Component list (left) -->
      <n-grid-item :span="5">
        <n-card title="页面组件" :bordered="false" class="shadow-sm">
          <template #header-extra>
            <n-button size="small" type="primary" @click="showAddComp = true">
              <template #icon><n-icon><AddOutline /></n-icon></template>
              添加
            </n-button>
          </template>

          <n-spin :show="loading">
            <div v-if="components.length" class="space-y-2">
              <div
                v-for="(comp, idx) in components"
                :key="comp.id"
                class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white"
              >
                <n-icon color="#999" class="cursor-move"><ReorderFourOutline /></n-icon>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm">{{ comp.component_type }}</div>
                  <div class="text-xs text-gray-400">模板: {{ comp.template ?? 'default' }} · 排序: {{ comp.sort }}</div>
                </div>
                <n-space size="small">
                  <n-button
                    size="tiny"
                    :disabled="idx === 0"
                    @click="moveUp(idx)"
                  >↑</n-button>
                  <n-button
                    size="tiny"
                    :disabled="idx === components.length - 1"
                    @click="moveDown(idx)"
                  >↓</n-button>
                  <n-popconfirm @positive-click="removeComp(comp.id)">
                    <template #trigger>
                      <n-button size="tiny" type="error">删除</n-button>
                    </template>
                    确认删除组件？
                  </n-popconfirm>
                </n-space>
              </div>
            </div>
            <n-empty v-else description="暂无组件，点击添加" />
          </n-spin>
        </n-card>
      </n-grid-item>

      <!-- Preview / DSL (right) -->
      <n-grid-item :span="7">
        <n-card title="布局 DSL" :bordered="false" class="shadow-sm">
          <n-code language="json" :code="dslJson" word-wrap />
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Add component modal -->
    <n-modal v-model:show="showAddComp" title="添加组件" preset="card" style="width: 400px">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="组件类型">
          <n-select v-model:value="newComp.type" :options="compTypeOptions" />
        </n-form-item>
        <n-form-item label="模板">
          <n-select v-model:value="newComp.template" :options="templateOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddComp = false">取消</n-button>
          <n-button type="primary" :loading="adding" @click="handleAdd">添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NCard, NSpace, NButton, NIcon, NSelect, NGrid, NGridItem, NSpin,
  NEmpty, NPopconfirm, NModal, NForm, NFormItem, NCode, useMessage,
} from 'naive-ui'
import { AddOutline, ReorderFourOutline } from '@vicons/ionicons5'
import { pageEditorApi } from '@/api/page-editor'
import { useSitesStore } from '@/store/sites'

const sitesStore = useSitesStore()
const message    = useMessage()

const selectedSiteId  = ref<string | undefined>()
const selectedPageType = ref('home')
const components      = ref<any[]>([])
const loading         = ref(false)
const showAddComp     = ref(false)
const adding          = ref(false)
const dslJson         = ref('{}')

const newComp = ref({ type: 'play_card', template: 'card_01' })

const siteOptions = computed(() => sitesStore.list.map(s => ({ label: s.name, value: s.id })))

const pageTypes = [
  { label: '首页',     value: 'home'       },
  { label: '开奖记录', value: 'results'    },
  { label: '玩法详情', value: 'play_detail'},
  { label: '统计中心', value: 'statistics' },
]

const compTypeOptions = [
  { label: 'logo（Logo）',             value: 'logo' },
  { label: 'result_board（开奖）',     value: 'result_board' },
  { label: 'banner_slider（轮播）',    value: 'banner_slider' },
  { label: 'play_card（玩法卡片）',    value: 'play_card' },
  { label: 'image_ad（图片广告）',     value: 'image_ad' },
  { label: 'category_entry（栏目）',   value: 'category_entry' },
  { label: 'statistics_card（统计）',  value: 'statistics_card' },
  { label: 'notice_board（公告）',     value: 'notice_board' },
]

const templateOptions = [
  { label: 'default', value: 'default' },
  { label: 'card_01 (经典)', value: 'card_01' },
  { label: 'card_02 (极简)', value: 'card_02' },
  { label: 'card_03 (高亮)', value: 'card_03' },
  { label: 'card_04 (排行)', value: 'card_04' },
]

function onSiteChange() {
  components.value = []
  dslJson.value = '{}'
  if (selectedSiteId.value && selectedPageType.value) loadComponents()
}

async function loadComponents() {
  if (!selectedSiteId.value || !selectedPageType.value) return
  loading.value = true
  try {
    components.value = await pageEditorApi.components(selectedSiteId.value, selectedPageType.value)
    const dsl = await pageEditorApi.getDsl(selectedSiteId.value, selectedPageType.value)
    dslJson.value = JSON.stringify(dsl, null, 2)
  } catch {
    components.value = []
  } finally {
    loading.value = false
  }
}

async function handleInit() {
  loading.value = true
  try {
    await pageEditorApi.init(selectedSiteId.value!, selectedPageType.value, { layout_code: 'layout_a', play_count: 50, ad_count: 10 })
    message.success('页面初始化成功')
    await loadComponents()
  } catch (e: any) {
    message.error(e?.message ?? '初始化失败')
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  if (!selectedSiteId.value || !selectedPageType.value) return
  adding.value = true
  try {
    await pageEditorApi.addComponent(selectedSiteId.value, selectedPageType.value, {
      component_type: newComp.value.type,
      template:       newComp.value.template,
    })
    message.success('组件已添加')
    showAddComp.value = false
    await loadComponents()
  } catch (e: any) {
    message.error(e?.message ?? '添加失败')
  } finally {
    adding.value = false
  }
}

async function removeComp(cid: string) {
  try {
    await pageEditorApi.removeComponent(selectedSiteId.value!, selectedPageType.value, cid)
    message.success('已删除')
    await loadComponents()
  } catch (e: any) {
    message.error(e?.message ?? '删除失败')
  }
}

async function moveUp(idx: number) {
  const ids = components.value.map(c => c.id)
  ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
  await pageEditorApi.sortComponents(selectedSiteId.value!, selectedPageType.value, { ids })
  await loadComponents()
}

async function moveDown(idx: number) {
  const ids = components.value.map(c => c.id)
  ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
  await pageEditorApi.sortComponents(selectedSiteId.value!, selectedPageType.value, { ids })
  await loadComponents()
}

onMounted(() => sitesStore.fetchList())
</script>
