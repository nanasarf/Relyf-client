import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Reads .env value; fallback HTTP (dev certificates may not be trusted by browser yet)
const apiBase = process.env.VITE_API_BASE_URL || 'http://localhost:5100'

export default defineConfig({
  plugins: [react()],
  appType: 'spa', // ensures BrowserRouter history fallback
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiBase,
        changeOrigin: true,
        secure: false, // allow self-signed https locally
      },
      '/swagger': {
        target: apiBase,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
