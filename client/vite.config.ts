import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7280', // <-- your API
        changeOrigin: true,
        secure: false,
      },
      // keep if you’ll call non-/api endpoints too (optional)
      '/swagger': {
        target: 'https://localhost:7280',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
