import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['https://da34cf46e667.ngrok-free.app', 'da34cf46e667.ngrok-free.app']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  // Make sure env variables are exposed
  envPrefix: 'VITE_',
});
