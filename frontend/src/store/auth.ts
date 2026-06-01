import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginDto } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token   = ref<string | null>(localStorage.getItem('access_token'))
  const user    = ref<{ id: string; username: string; role: string } | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => ['SuperAdmin', 'Admin'].includes(user.value?.role ?? ''))

  async function login(dto: LoginDto) {
    loading.value = true
    try {
      const res = await authApi.login(dto)
      token.value = res.access_token
      user.value  = res.user
      localStorage.setItem('access_token', res.access_token)
      router.push('/')
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await authApi.profile()
      user.value = res
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  return { token, user, loading, isLoggedIn, isAdmin, login, fetchProfile, logout }
})
