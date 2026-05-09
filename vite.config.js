import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** SWA deploy uses `app_location: dist` only — config must live in dist for SPA fallback + routes */
function copyStaticWebAppConfig() {
  return {
    name: 'copy-staticwebapp-config',
    closeBundle() {
      const src = path.resolve(__dirname, 'staticwebapp.config.json')
      const dest = path.resolve(__dirname, 'dist/staticwebapp.config.json')
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
    copyStaticWebAppConfig(),
  ],
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
