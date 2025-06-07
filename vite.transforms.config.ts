import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/transforms.ts'),
      name: 'dl',
      formats: ['umd'],
      fileName: () => 'transforms.v2.js'
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});
