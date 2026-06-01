import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward /api/v1/* straight to NestJS (global prefix = api/v1)
      '/api': {
        target:       'http://localhost:3000',
        changeOrigin: true,
        // No rewrite — NestJS receives /api/v1/... as-is
      },
    },
  },
})
