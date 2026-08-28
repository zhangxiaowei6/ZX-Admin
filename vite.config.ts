import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** 构建时生成 version.json 到 dist 目录，用于前端版本更新检测 */
function versionPlugin(version: string): Plugin {
  return {
    name: 'version-json',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(
        path.resolve(outDir, 'version.json'),
        JSON.stringify({ version }),
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
  const appVersion = `${pkg.version}-${Date.now()}`

  return {
    // demo 模式部署到 GitHub Pages 根路径
    base: env.VITE_BASE_PATH || '/',
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      versionPlugin(appVersion),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-antd': ['antd', '@ant-design/icons'],
            'vendor-pro': ['@ant-design/pro-components'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-i18n': ['i18next', 'react-i18next'],
          },
        },
      },
    },
  }
})
