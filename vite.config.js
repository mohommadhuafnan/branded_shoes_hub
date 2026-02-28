import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/branded_shoes_hub/',
  plugins: [react()],
})