import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8850,
    proxy: {
      // GIS 后端（Vite 侧服务名必须带 /api 前缀，后端路由自带 /api/v1）
      '/api/v1/gis': {
        target: 'http://127.0.0.1:7002',
        changeOrigin: true,
      },
      // 现有 admin 基础登录接口（账号复用）
      '/api/v1/base': {
        target: 'http://127.0.0.1:7001',
        changeOrigin: true,
      },
    },
  },
})
