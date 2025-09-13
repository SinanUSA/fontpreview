import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: 'index.html',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        products: 'products.html',
      },
    },
  },
});
