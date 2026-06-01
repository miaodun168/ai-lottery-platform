import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: '',          name: 'Dashboard',   component: () => import('@/pages/DashboardPage.vue') },
        { path: 'sites',     name: 'Sites',       component: () => import('@/pages/SitesPage.vue') },
        { path: 'ai',        name: 'AI',          component: () => import('@/pages/AiCommandPage.vue') },
        { path: 'plays',     name: 'Plays',       component: () => import('@/pages/PlaysPage.vue') },
        { path: 'results',   name: 'Results',     component: () => import('@/pages/ResultsPage.vue') },
        { path: 'calendar',  name: 'Calendar',    component: () => import('@/pages/HkCalendarPage.vue') },
        { path: 'pages',     name: 'PageEditor',  component: () => import('@/pages/PageEditorPage.vue') },
        { path: 'statistics',name: 'Statistics',  component: () => import('@/pages/StatisticsPage.vue') },
        { path: 'settings',  name: 'Settings',    component: () => import('@/pages/SettingsPage.vue') },
        { path: 'tasks',     name: 'Tasks',       component: () => import('@/pages/TasksPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  if (!to.meta.public && !token) return '/login'
})

export default router
