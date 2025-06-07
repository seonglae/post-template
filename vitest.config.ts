import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: 'jsdom-global/register',
    include: ['test/**/*.{js,ts}'],
    exclude: ['test/helpers.js'],
    globals: true
  }
});
