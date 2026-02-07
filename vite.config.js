import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/managemypg': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
