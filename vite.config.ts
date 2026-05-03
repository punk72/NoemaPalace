import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
		host: true,
		allowedHosts: true,
    proxy: {
      '/book_proxy/aladin': {
        target: 'https://www.aladin.co.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/book_proxy\/aladin/, ''),
      },
      '/book_proxy/nlk': {
        target: 'https://nl.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/book_proxy\/nlk/, ''),
      },
    },
  },
})
