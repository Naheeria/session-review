import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/session-review/', // 본인의 GitHub 저장소 이름으로 변경
})