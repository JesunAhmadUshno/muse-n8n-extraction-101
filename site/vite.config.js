import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The site reads ../README.md and ../docs/*.md at build time, so every number on the page comes from the repo's own files.
export default defineConfig({
  base: '/muse-n8n-extraction-101/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
});
