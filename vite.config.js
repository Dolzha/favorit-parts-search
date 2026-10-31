import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' чтобы сборка открывалась из любой подпапки (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
});
