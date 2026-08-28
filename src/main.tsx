// 过滤 antd 内部 findDOMNode 废弃警告（antd 尚未完全移除该 API 调用）
const originalError = console.error
console.error = (...args: Parameters<typeof console.error>) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) return
  originalError.apply(console, args)
}

import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './locales'
import './index.css'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0,
    },
  },
})

// demo 模式使用 HashRouter 避免 GitHub Pages 刷新 404
// 其他环境使用 BrowserRouter 获得更好的 URL
const Router = import.meta.env.MODE === 'demo' ? HashRouter : BrowserRouter

async function bootstrap() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router basename={import.meta.env.MODE === 'demo' ? undefined : import.meta.env.VITE_BASE_PATH}>
          <App />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

bootstrap()
