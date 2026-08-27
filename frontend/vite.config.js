import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
              return 'vendor-react'
            }
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps'
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf'
            }
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            return 'vendor-libs'
          }
        },
      },
    },
  },
})
