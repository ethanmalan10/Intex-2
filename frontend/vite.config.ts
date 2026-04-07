import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: ['intex-2-production.up.railway.app', 'all']
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
