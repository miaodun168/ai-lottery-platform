<template>
  <div>
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex flex-wrap gap-3 items-center justify-between">
        <n-space>
          <n-select
            v-model:value="filters.site_id"
            :options="siteOptions"
            placeholder="选择站点"
            clearable
            style="width:160px"
            @update:value="reload"
          />
          <n-select
            v-model:value="filters.lottery_type"
            :options="lotteryOptions"
            placeholder="采种"
            clearable
            style="width:120px"
            @update:value="reload"
          />
          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="状态"
            clearable
            style="width:120px"
            @update:value="reload"
          />
          <n-input v-model:value="search" placeholder="搜索玩法名" clearable style="width:180px" />
        </n-space>
        <n-button type="primary" @click="openCreate">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          新增玩法
        </n-button>
      </div>
    </n-card>

    <n-card :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="filtered"
        :loading="playsStore.loading"
        :pagination="{ pageSize: 15 }"
        striped
      />
    </n-card>

    <!-- Modal -->
    <n-modal v-model:show="showModal" :title="editId ? '编辑玩法' : '新增玩法'" preset="card" style="width: 480px">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="所属站点" path="site_id">
          <n-select v-model:value="form.site_id" :options="siteOptions" placeholder="选择站点" />
        </n-form-item>
        <n-form-item label="采种" path="lottery_type">
          <n-radio-group v-model:value="form.lottery_type">
            <n-radio value="hk">香港</n-radio>
            <n-radio value="mo">澳门</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="玩法规则" path="rule_code">
          <n-select
            v-model:value="form.rule_code"
            :options="ruleOptions"
            filterable
            placeholder="选择规则"
            @update:value="v => { const r = playsStore.rules.find(x => x.rule_code === v); if (r) form.name = r.rule_name }"
          />
        </n-form-item>
        <n-form-item label="显示名称" path="name">
          <n-input v-model:value="form.name" placeholder="玩法名称" />
        </n-form-item>
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
  NCard, NSpace, NInput, NButton, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NRadioGroup, NRadio, NTag, NPopconfirm, useMessage,
  type DataTableColumns, type FormInst, type FormRules,
} from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { usePlaysStore } from '@/store/plays'
import { useSitesStore } from '@/store/sites'
import type { Play } from '@/api/plays'

const playsStore = usePlaysStore()
const sitesStore = useSitesStore()
const message    = useMessage()

const search    = ref('')
const showModal = ref(false)
const editId    = ref<string | null>(null)
const submitting = ref(false)
const formRef   = ref<FormInst | null>(null)

const filters   = ref({ site_id: undefined as string | undefined, lottery_type: undefined as string | undefined, status: undefined as string | undefined })
const form      = ref({ site_id: 0, lottery_type: 'hk', rule_code: '', name: '' })

const rules: FormRules = {
  site_id:   [{ required: true, type: 'number', message: '请选择站点' }],
  rule_code: [{ required: true, message: '请选择规则' }],
  name:      [{ required: true, message: '请填写名称' }],
}

const siteOptions   = computed(() => sitesStore.list.map(s => ({ label: s.name, value: s.id })))
const ruleOptions   = computed(() => playsStore.rules.map(r => ({ label: `${r.rule_name}（${r.rule_code}）`, value: r.rule_code })))
const lotteryOptions = [{ label: '香港', value: 'hk' }, { label: '澳门', value: 'mo' }]
const statusOptions  = [{ label: '启用', value: 'active' }, { label: '停用', value: 'disabled' }]

const filtered = computed(() => {
  let data = playsStore.list
  if (search.value) data = data.filter(p => p.name.includes(search.value))
  return data
})

const statusTagType: Record<string, any> = { active: 'success', disabled: 'error' }

const columns: DataTableColumns<Play> = [
  { title: 'ID',      key: 'id',           width: 80 },
  { title: '玩法名称', key: 'name',         ellipsis: true },
  { title: '规则码',   key: 'rule_code',    width: 100 },
  { title: '采种',     key: 'lottery_type', width: 80 },
  {
    title: '命中率', key: 'hit_rate', width: 90,
    render: r => r.hit_rate != null ? `${r.hit_rate}%` : '-',
  },
  {
    title: '状态', key: 'status', width: 90,
    render: r => h(NTag, { type: statusTagType[r.status] ?? 'default', size: 'small', round: true }, () => r.status === 'active' ? '启用' : '停用'),
  },
  {
    title: '操作', key: 'actions', width: 220, fixed: 'right',
    render: (row) => h(NSpace, {}, () => [
      h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
      row.status === 'active'
        ? h(NButton, { size: 'small', onClick: () => handleDisable(row.id) }, () => '停用')
        : h(NButton, { size: 'small', type: 'success', onClick: () => handleEnable(row.id) }, () => '启用'),
      h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
        default: () => `确认删除玩法 "${row.name}"？`,
        trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
      }),
    ]),
  },
]

function openCreate() {
  editId.value = null
  form.value   = { site_id: parseInt(sitesStore.list[0]?.id ?? '0'), lottery_type: 'hk', rule_code: '', name: '' }
  showModal.value = true
}

function openEdit(play: Play) {
  editId.value = play.id
  form.value   = { site_id: parseInt(play.site_id), lottery_type: play.lottery_type, rule_code: play.rule_code, name: play.name }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editId.value) {
      await playsStore.update(editId.value, form.value)
      message.success('更新成功')
    } else {
      await playsStore.create(form.value)
      message.success('玩法已创建')
    }
    showModal.value = false
  } catch (e: any) {
    if (typeof e !== 'object' || !Array.isArray(e)) message.error(e?.message ?? '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDisable(id: string) {
  await playsStore.disable(id)
  message.success('已停用')
}

async function handleEnable(id: string) {
  await playsStore.enable(id)
  message.success('已启用')
}

async function handleDelete(id: string) {
  await playsStore.remove(id)
  message.success('已删除')
}

async function reload() {
  await playsStore.fetchList(filters.value)
}

onMounted(async () => {
  await Promise.all([
    sitesStore.fetchList(),
    playsStore.fetchRules(),
    playsStore.fetchList(),
  ])
})
</script>
