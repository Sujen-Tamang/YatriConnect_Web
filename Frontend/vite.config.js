import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // or your respective framework plugin
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
      'process.env': process.env
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000/',
        changeOrigin: true,
        rewrite: (path) => path.replace("/api/", ''),
      },
    },
  },
});
