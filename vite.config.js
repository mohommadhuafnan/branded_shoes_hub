import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = (env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '')
  const proxyTarget = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase

  return {
    base: '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})