import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'template.v2': 'src/components.ts',
        'transforms.v2': 'src/transforms/index.ts',
      },
      formats: ['es'],
    },
    outDir: 'public',
    emptyOutDir: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
}) 