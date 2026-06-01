<template>
  <n-layout has-sider style="height: 100vh;">
    <!-- Sidebar -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <!-- Logo -->
      <div class="flex items-center px-4 py-3 border-b" style="height: var(--header-height);">
        <n-icon size="28" color="#18a058"><BarChart /></n-icon>
        <span v-if="!collapsed" class="ml-2 font-bold text-base text-gray-800 whitespace-nowrap">AI彩票后台</span>
      </div>
      <!-- Menu -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <n-layout>
      <!-- Header -->
      <n-layout-header bordered style="height: var(--header-height); padding: 0 20px;" class="flex items-center justify-between">
        <n-breadcrumb>
          <n-breadcrumb-item>管理后台</n-breadcrumb-item>
          <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
        </n-breadcrumb>
        <n-space>
          <n-tag type="success" round size="small">{{ authStore.user?.role ?? '' }}</n-tag>
          <n-dropdown :options="userMenuOptions" @select="handleUserMenu">
            <n-button text>
              <n-icon size="20"><PersonCircle /></n-icon>
              <span class="ml-1">{{ authStore.user?.username ?? '管理员' }}</span>
            </n-button>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <!-- Content -->
      <n-layout-content
        content-style="padding: 20px; overflow-y: auto;"
        style="height: calc(100vh - var(--header-height));"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout, NLayoutSider, NLayoutHeader, NLayoutContent,
  NMenu, NBreadcrumb, NBreadcrumbItem, NButton, NIcon, NTag, NSpace, NDropdown,
  type MenuOption,
} from 'naive-ui'
import {
  GridOutline as Grid, BusinessOutline as Business, BulbOutline as Bulb,
  FileTrayFullOutline as FileTray, CalendarOutline as Calendar,
  BarChartOutline as BarChart, SettingsOutline as Settings,
  ListOutline as List, LayersOutline as Layers, TerminalOutline as Terminal,
  PersonCircleOutline as PersonCircle,
} from '@vicons/ionicons5'
import { h } from 'vue'
import { useAuthStore } from '@/store/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  { label: '控制台',    key: '/',           icon: renderIcon(Grid) },
  { label: '站点管理',  key: '/sites',      icon: renderIcon(Business) },
  { label: 'AI命令中心',key: '/ai',         icon: renderIcon(Bulb) },
  { label: '玩法管理',  key: '/plays',      icon: renderIcon(List) },
  { label: '开奖管理',  key: '/results',    icon: renderIcon(FileTray) },
  { label: '香港日历',  key: '/calendar',   icon: renderIcon(Calendar) },
  { label: '页面编辑',  key: '/pages',      icon: renderIcon(Layers) },
  { label: '统计中心',  key: '/statistics', icon: renderIcon(BarChart) },
  { label: '任务中心',  key: '/tasks',      icon: renderIcon(Terminal) },
  { label: '系统配置',  key: '/settings',   icon: renderIcon(Settings) },
]

const pageTitles: Record<string, string> = {
  '/': '控制台', '/sites': '站点管理', '/ai': 'AI命令中心',
  '/plays': '玩法管理', '/results': '开奖管理', '/calendar': '香港日历',
  '/pages': '页面编辑器', '/statistics': '统计中心', '/settings': '系统配置',
  '/tasks': '任务中心',
}

const activeKey = computed(() => route.path)
const currentPageTitle = computed(() => pageTitles[route.path] ?? '管理后台')

function handleMenuSelect(key: string) {
  router.push(key)
}

const userMenuOptions = [
  { label: '退出登录', key: 'logout' },
]

function handleUserMenu(key: string) {
  if (key === 'logout') authStore.logout()
}
</script>
