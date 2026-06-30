import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/managemypg': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios', 'dayjs', 'framer-motion', 'lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
