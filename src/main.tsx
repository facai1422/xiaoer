import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './styles/neumorphism.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeApp } from './utils/appInitializer'

// 初始化应用
const initInfo = initializeApp();
console.log('应用初始化信息:', initInfo);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5分钟
      refetchOnWindowFocus: false,
      refetchOnMount: false, // 防止重复获取
      refetchOnReconnect: false, // 防止网络重连时重复获取
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
)
