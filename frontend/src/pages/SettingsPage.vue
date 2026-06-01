<template>
  <div>
    <n-card title="系统配置" :bordered="false" class="shadow-sm">
      <n-spin :show="settingsStore.loading">
        <n-form
          ref="formRef"
          :model="form"
          label-placement="left"
          label-width="160"
          style="max-width: 600px"
        >
          <n-divider title-placement="left">基础配置</n-divider>
          <n-form-item label="系统名称">
            <n-input v-model:value="form.system_name" placeholder="AI彩票管理系统" />
          </n-form-item>
          <n-form-item label="默认采种">
            <n-select v-model:value="form.default_lottery_type" :options="lotteryOptions" />
          </n-form-item>

          <n-divider title-placement="left">玩法配置</n-divider>
          <n-form-item label="默认玩法数量">
            <n-input-number v-model:value="form.default_play_count" :min="1" :max="500" />
          </n-form-item>
          <n-form-item label="默认广告数量">
            <n-input-number v-model:value="form.default_ad_count" :min="0" :max="100" />
          </n-form-item>

          <n-divider title-placement="left">规则配置</n-divider>
          <n-form-item label="连错隐藏期数">
            <n-input-number v-model:value="form.miss_hide_limit" :min="0" :max="20" />
          </n-form-item>
          <n-form-item label="显示更新中期数">
            <n-input-number v-model:value="form.show_updating_periods" :min="0" :max="10" />
          </n-form-item>
          <n-form-item label="开启更新中显示">
            <n-switch v-model:value="form.show_updating" />
          </n-form-item>

          <n-divider title-placement="left">数据修复</n-divider>
          <n-form-item label="全量重算统计">
            <n-space>
              <n-select v-model:value="rebuildLotteryType" :options="lotteryOptions" style="width:120px" />
              <n-button type="warning" :loading="rebuilding" @click="handleRebuild">
                立即重算
              </n-button>
            </n-space>
          </n-form-item>

          <div class="mt-6">
            <n-button type="primary" :loading="saving" @click="handleSave">
              保存配置
            </n-button>
          </div>
        </n-form>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch,
  NDivider, NButton, NSpace, NSpin, useMessage,
} from 'naive-ui'
import { useSettingsStore } from '@/store/settings'
import { statisticsApi } from '@/api/statistics'

const settingsStore = useSettingsStore()
const message       = useMessage()
const saving        = ref(false)
const rebuilding    = ref(false)
const rebuildLotteryType = ref('hk')

const lotteryOptions = [
  { label: '香港', value: 'hk' },
  { label: '澳门', value: 'mo' },
]

const form = ref({
  system_name:           'AI彩票管理系统',
  default_lottery_type:  'hk',
  default_play_count:    50,
  default_ad_count:      10,
  miss_hide_limit:       3,
  show_updating_periods: 2,
  show_updating:         true,
})

async function handleSave() {
  saving.value = true
  try {
    await settingsStore.save({ ...form.value })
    message.success('配置已保存')
  } catch (e: any) {
    message.error(e?.message ?? '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleRebuild() {
  rebuilding.value = true
  try {
    const res = await statisticsApi.rebuildAll(rebuildLotteryType.value)
    message.success(res.message ?? '重算完成')
  } catch (e: any) {
    message.error(e?.message ?? '重算失败')
  } finally {
    rebuilding.value = false
  }
}

onMounted(async () => {
  await settingsStore.fetch()
  const d = settingsStore.data
  if (d && Object.keys(d).length) {
    Object.assign(form.value, {
      system_name:           d.system_name           ?? form.value.system_name,
      default_lottery_type:  d.default_lottery_type  ?? form.value.default_lottery_type,
      default_play_count:    d.default_play_count    ?? form.value.default_play_count,
      default_ad_count:      d.default_ad_count      ?? form.value.default_ad_count,
      miss_hide_limit:       d.miss_hide_limit       ?? form.value.miss_hide_limit,
      show_updating_periods: d.show_updating_periods ?? form.value.show_updating_periods,
      show_updating:         d.show_updating         ?? form.value.show_updating,
    })
  }
})
</script>
