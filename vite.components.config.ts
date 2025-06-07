import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components.ts'),
      name: 'dl',
      formats: ['umd'],
      fileName: () => 'template.v2.js'
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});
