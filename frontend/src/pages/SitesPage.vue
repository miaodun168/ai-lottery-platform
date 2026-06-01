<template>
  <div>
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex justify-between items-center">
        <n-space>
          <n-input v-model:value="search" placeholder="搜索站点" clearable style="width:220px">
            <template #prefix><n-icon><SearchOutline /></n-icon></template>
          </n-input>
        </n-space>
        <n-button type="primary" @click="openCreate">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          新建站点
        </n-button>
      </div>
    </n-card>

    <n-card :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="filtered"
        :loading="sitesStore.loading"
        :pagination="{ pageSize: 10 }"
        striped
      />
    </n-card>

    <!-- Create/Edit Modal -->
    <n-modal v-model:show="showModal" :title="editId ? '编辑站点' : '新建站点'" preset="card" style="width: 520px">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="100">
        <n-form-item label="站点名称" path="name">
          <n-input v-model:value="form.name" placeholder="例如：财富阁" />
        </n-form-item>
        <n-form-item label="域名" path="domain">
          <n-input v-model:value="form.domain" placeholder="例如：caifuge.com（可选）" />
        </n-form-item>
        <n-form-item label="采种" path="lottery_types">
          <n-checkbox-group v-model:value="form.lottery_types">
            <n-space>
              <n-checkbox value="hk" label="香港" />
              <n-checkbox value="mo" label="澳门" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="默认主题">
          <n-select v-model:value="form.theme" :options="themeOptions" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-grid-item>
            <n-form-item label="玩法数量">
              <n-input-number v-model:value="form.play_count" :min="1" :max="200" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="广告数量">
              <n-input-number v-model:value="form.ad_count" :min="0" :max="50" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NButton, NIcon, NDataTable, NModal, NForm,
  NFormItem, NSelect, NInputNumber, NCheckboxGroup, NCheckbox, NGrid,
  NGridItem, NTag, NPopconfirm, useMessage, type DataTableColumns, type FormInst, type FormRules,
} from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'
import { useSitesStore } from '@/store/sites'
import type { Site } from '@/api/sites'

const sitesStore = useSitesStore()
const message    = useMessage()
const search     = ref('')
const showModal  = ref(false)
const editId     = ref<string | null>(null)
const submitting = ref(false)
const formRef    = ref<FormInst | null>(null)

const form = ref({ name: '', domain: '', lottery_types: ['hk'] as string[], theme: 'theme_default', play_count: 50, ad_count: 10 })

const rules: FormRules = {
  name: [{ required: true, message: '请填写站点名称', trigger: 'blur' }],
}

const themeOptions = [
  { label: '默认主题', value: 'theme_default' },
  { label: '红金主题', value: 'theme_red_gold' },
  { label: '科技蓝', value: 'theme_tech' },
  { label: '暗黑主题', value: 'theme_dark' },
]

const filtered = computed(() =>
  sitesStore.list.filter(s => !search.value || s.name.includes(search.value) || (s.domain ?? '').includes(search.value))
)

const statusTagType: Record<string, any> = {
  published: 'success', draft: 'warning', disabled: 'error', testing: 'info',
}

const columns: DataTableColumns<Site> = [
  { title: 'ID',     key: 'id',     width: 80 },
  { title: '站点名', key: 'name',   ellipsis: true },
  { title: '域名',   key: 'domain', ellipsis: true, render: r => r.domain ?? r.code },
  {
    title: '状态', key: 'status', width: 100,
    render: r => h(NTag, { type: statusTagType[r.status] ?? 'default', size: 'small', round: true }, () => r.status),
  },
  { title: '创建时间', key: 'created_at', width: 180, render: r => r.created_at?.slice(0, 19) ?? '' },
  {
    title: '操作', key: 'actions', width: 260, fixed: 'right',
    render: (row) => h(NSpace, {}, () => [
      h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
      h(NButton, { size: 'small', type: 'primary', onClick: () => handlePublish(row.id) }, () => '发布'),
      h(NButton, { size: 'small', onClick: () => handleSuspend(row.id) }, () => '暂停'),
      h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
        default: () => `确认删除站点 "${row.name}"？`,
        trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
      }),
    ]),
  },
]

function openCreate() {
  editId.value = null
  form.value   = { name: '', domain: '', lottery_types: ['hk'], theme: 'theme_default', play_count: 50, ad_count: 10 }
  showModal.value = true
}

function openEdit(site: Site) {
  editId.value = site.id
  form.value   = {
    name: site.name, domain: site.domain ?? '', lottery_types: ['hk'],
    theme: 'theme_default', play_count: 50, ad_count: 10,
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editId.value) {
      await sitesStore.update(editId.value, form.value)
      message.success('更新成功')
    } else {
      await sitesStore.create(form.value)
      message.success('站点创建成功')
    }
    showModal.value = false
  } catch (e: any) {
    if (typeof e !== 'object' || !Array.isArray(e)) message.error(e?.message ?? '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handlePublish(id: string) {
  await sitesStore.publish(id)
  message.success('已发布')
}

async function handleSuspend(id: string) {
  await sitesStore.suspend(id)
  message.success('已暂停')
}

async function handleDelete(id: string) {
  await sitesStore.remove(id)
  message.success('已删除')
}

onMounted(() => sitesStore.fetchList())
</script>
