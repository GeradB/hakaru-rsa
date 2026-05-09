import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [],
    },
  })],
  server: {
    host: true,
    port: 5173,
    hmr: false,
    https: {
      key: path.resolve(__dirname, 'certs/key.pem'),
      cert: path.resolve(__dirname, 'certs/cert.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    jsxInject: '',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
