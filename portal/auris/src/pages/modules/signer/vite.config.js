
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Importante: '.' ou './' permite que os assets funcionem no protocolo file:// do Electron
  base: './',
  server: {
    allowedHosts: true,
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
