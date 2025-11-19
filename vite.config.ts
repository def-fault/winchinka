import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When the site is opened directly from the built `dist` folder (e.g. via `file://`),
// assets living under `public/` need to be referenced with relative paths instead of
// absolute `/` URLs. Using a dynamic base ensures dev server still serves from `/`
// while production builds emit `./` references so files like `bgm1.mp3` or
// `season1-1.png` load correctly in that offline scenario.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
}));