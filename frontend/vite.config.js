import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 중에는 /api 요청을 Spring Boot(8080)로 넘긴다. 같은 origin이 되어 세션 쿠키가 그대로 오간다.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
