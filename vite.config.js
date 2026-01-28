import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // base must match your repository name for GitHub Pages to find assets
  base: '/TheAlchemistAlley9/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Ensures a clean build without the extra shadow-dom overhead
    sourcemap: true,
    emptyOutDir: true,
  },
});
