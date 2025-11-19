import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/winchinka/',   // 🔥 GitHub Pages 배포 시 필수!
})