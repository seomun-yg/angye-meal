import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages의 하위 저장소 주소에서도 정적 파일을 찾도록 합니다.
  base: './',
})
