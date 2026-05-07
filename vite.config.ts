import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Performance-focused config with manual chunking to solve bundle size issues
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          viz: ['d3', 'dagre'],
          utils: ['dompurify', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    headers: {
      // Security headers for modern browser environments
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';",
    },
  },
});