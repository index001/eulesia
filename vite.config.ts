import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching & realtime
          'vendor-data': ['@tanstack/react-query', 'socket.io-client'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-http-backend', 'i18next-browser-languagedetector'],
          // Map
          'vendor-map': ['leaflet', 'react-leaflet', 'react-leaflet-cluster'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Sanitization
          'vendor-sanitize': ['dompurify'],
        }
      }
    }
  }
})
