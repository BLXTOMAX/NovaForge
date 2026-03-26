import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/create-checkout-session': 'http://localhost:3001',
      '/order': 'http://localhost:3001',
      '/support': 'http://localhost:3001',
      '/session': 'http://localhost:3001',
      '/test-mail': 'http://localhost:3001',
      '/ping-test-123': 'http://localhost:3001',
    },
  },
})
