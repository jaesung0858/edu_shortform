import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 중 API 요청은 Spring Boot 서버로 전달한다.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
