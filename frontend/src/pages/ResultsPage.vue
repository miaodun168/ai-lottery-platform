<template>
  <div>
    <n-card :bordered="false" class="shadow-sm mb-4">
      <div class="flex justify-between items-center">
        <n-space>
          <n-select
            v-model:value="filters.lottery_type"
            :options="lotteryOptions"
            placeholder="采种"
            clearable
            style="width:120px"
            @update:value="reload"
          />
          <n-select
            v-model:value="filters.year"
            :options="yearOptions"
            placeholder="年份"
            clearable
            style="width:120px"
            @update:value="reload"
          />
        </n-space>
        <n-button type="primary" @click="openCreate">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          录入开奖
        </n-button>
      </div>
    </n-card>

    <n-card :bordered="false" class="shadow-sm">
      <n-data-table
        :columns="columns"
        :data="resultsStore.list"
        :loading="resultsStore.loading"
        :pagination="{ pageSize: 15 }"
        striped
      />
    </n-card>

    <!-- Create Modal -->
    <n-modal v-model:show="showModal" title="录入开奖结果" preset="card" style="width: 520px">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="采种" path="lottery_type">
          <n-radio-group v-model:value="form.lottery_type">
            <n-radio value="hk">香港</n-radio>
            <n-radio value="mo">澳门</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="期号" path="period">
          <n-input v-model:value="form.period" placeholder="例如：2026001" />
        </n-form-item>
        <n-form-item label="6个平码" path="normals">
          <div class="flex gap-2">
            <n-input-number
              v-for="i in 6" :key="i"
              v-model:value="form.normals[i-1]"
              :min="1" :max="49"
              style="width: 72px"
              :placeholder="`${i}`"
            />
          </div>
        </n-form-item>
        <n-form-item label="特码" path="special">
          <n-input-number v-model:value="form.special" :min="1" :max="49" placeholder="特码" style="width:90px" />
        </n-form-item>
      </n-form>
      <n-alert v-if="form.normals.some(n => !n) || !form.special" type="warning" title="请填写全部7个号码（6平码+1特码）" class="mt-3" />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">提交</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard, NSpace, NButton, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NRadioGroup, NRadio, NInput, NInputNumber, NTag, NAlert,
  useMessage, type DataTableColumns, type FormInst, type FormRules,
} from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useResultsStore } from '@/store/results'
import type { LotteryResult } from '@/api/results'

const resultsStore = useResultsStore()
const message      = useMessage()

const filters   = ref({ lottery_type: 'hk' as string | undefined, year: undefined as string | undefined })
const showModal = ref(false)
const submitting = ref(false)
const formRef   = ref<FormInst | null>(null)

const form = ref({
  lottery_type: 'hk', period: '',
  normals: [null, null, null, null, null, null] as (number | null)[],
  special: null as number | null,
})

const rules: FormRules = {
  period:       [{ required: true, message: '请填写期号' }],
  lottery_type: [{ required: true, message: '请选择采种' }],
}

const lotteryOptions = [{ label: '香港', value: 'hk' }, { label: '澳门', value: 'mo' }]
const yearOptions    = computed(() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(y => ({ label: String(y), value: String(y) }))
})

const columns: DataTableColumns<LotteryResult> = [
  { title: '期号',    key: 'period',       width: 100 },
  { title: '采种',    key: 'lottery_type', width: 80 },
  {
    title: '号码', key: 'numbers', minWidth: 260,
    render: (row) => {
      if (!row.numbers) return '-'
      return h('div', { class: 'flex flex-wrap gap-1' }, row.numbers.map(n =>
        h('span', {
          class: `inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold`,
          style: `background:${waveColor(n.wave)}`,
        }, String(n.number).padStart(2, '0'))
      ))
    },
  },
  { title: '开奖时间', key: 'draw_date', width: 180, render: r => r.draw_date?.slice(0, 10) ?? '' },
  { title: '状态',    key: 'status',      width: 90 },
]

function waveColor(wave: string) {
  return wave === '红波' ? '#e53e3e' : wave === '蓝波' ? '#3182ce' : '#38a169'
}

function openCreate() {
  form.value = { lottery_type: 'hk', period: '', normals: [null, null, null, null, null, null], special: null }
  showModal.value = true
}

async function handleSubmit() {
  if (form.value.normals.some(n => !n) || !form.value.special) {
    message.warning('请填写全部7个号码')
    return
  }
  try {
    await formRef.value?.validate()
    submitting.value = true
    const numbers = [...form.value.normals.map(n => n!), form.value.special!]
    await resultsStore.create({ lottery_type: form.value.lottery_type, period: form.value.period, numbers })
    message.success('开奖录入成功，已触发自动结算')
    showModal.value = false
  } catch (e: any) {
    if (typeof e !== 'object' || !Array.isArray(e)) message.error(e?.message ?? '录入失败')
  } finally {
    submitting.value = false
  }
}

async function reload() {
  await resultsStore.fetchList({ lottery_type: filters.value.lottery_type, year: filters.value.year })
}

onMounted(() => reload())
</script>
