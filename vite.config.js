import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Repo name fix for The Pass
  base: '/ThePass/', 
  plugins: [react()],
  resolve: {
    alias: {
      // This maps the "@" symbol to your src folder
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    emptyOutDir: true,
  },
});
