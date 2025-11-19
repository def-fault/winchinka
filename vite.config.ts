// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🔥 커스텀 도메인(windslayer.online)을 쓰니까
  // 더 이상 '/winchinka/' 같은 하위 경로를 쓰면 안 됩니다.
  // base를 '/'로 두거나, 이 줄 자체를 없애도 됩니다.
  base: '/',
});