<template>
  <div class="min-h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <n-card style="width: 400px;" title="AI彩票管理系统">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="form.username" placeholder="请输入用户名" size="large" @keydown.enter="handleLogin" />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password" type="password" show-password-on="click"
            placeholder="请输入密码" size="large" @keydown.enter="handleLogin"
          />
        </n-form-item>
        <n-button type="primary" block size="large" :loading="authStore.loading" @click="handleLogin">
          登录
        </n-button>
      </n-form>

      <n-alert v-if="error" type="error" class="mt-4" :title="error" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton, NAlert, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const message   = useMessage()
const formRef   = ref<FormInst | null>(null)
const error     = ref('')

const form = ref({ username: '', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码',   trigger: 'blur' }],
}

async function handleLogin() {
  error.value = ''
  try {
    await formRef.value?.validate()
    await authStore.login({ username: form.value.username, password: form.value.password })
    message.success('登录成功')
  } catch (e: any) {
    error.value = e?.message ?? (e?.error ?? '用户名或密码错误')
  }
}
</script>
