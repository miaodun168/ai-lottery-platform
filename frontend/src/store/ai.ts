import { defineStore } from 'pinia'
import { ref } from 'vue'
import { aiApi, type AiCommandDto, type AiCommandResponse, type AiTask, type CommandLog } from '@/api/ai'

export const useAiStore = defineStore('ai', () => {
  const tasks       = ref<AiTask[]>([])
  const logs        = ref<CommandLog[]>([])
  const lastResponse = ref<AiCommandResponse | null>(null)
  const loading     = ref(false)
  const taskTotal   = ref(0)
  const logTotal    = ref(0)

  async function sendCommand(dto: AiCommandDto) {
    loading.value = true
    try {
      lastResponse.value = await aiApi.command(dto)
      return lastResponse.value
    } finally {
      loading.value = false
    }
  }

  async function previewCommand(dto: AiCommandDto) {
    return aiApi.preview(dto)
  }

  async function fetchTasks(params?: { page?: number; limit?: number }) {
    const res = await aiApi.getTasks(params)
    tasks.value = res.items ?? (res as any)
    taskTotal.value = res.total ?? tasks.value.length
  }

  async function fetchTask(id: string) {
    return aiApi.getTask(id)
  }

  async function fetchLogs(params?: { site_id?: string; page?: number; limit?: number }) {
    const res = await aiApi.getLogs(params)
    logs.value = res.items ?? (res as any)
    logTotal.value = res.total ?? logs.value.length
  }

  return { tasks, logs, lastResponse, loading, taskTotal, logTotal, sendCommand, previewCommand, fetchTasks, fetchTask, fetchLogs }
})
