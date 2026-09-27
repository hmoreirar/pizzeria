import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo, el navegador solo habla con Vite. Vite reenvía
    // las peticiones a /api al backend, evitando problemas de CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
