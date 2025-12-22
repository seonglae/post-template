import { defineConfig } from 'vitest/config'
import pkg from './package.json'

// Extract GitHub repo URL from package.json repository field
function getRepoUrl(): string {
  const repoUrl = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url
  if (!repoUrl) return 'https://github.com/seonglae/post-template'
  // Convert git+https://github.com/user/repo.git to https://github.com/user/repo
  return repoUrl.replace(/^git\+/, '').replace(/\.git$/, '')
}

export default defineConfig({
  define: {
    __REPO_URL__: JSON.stringify(getRepoUrl()),
  },
  build: {
    lib: {
      entry: {
        'template.v2': 'src/components.ts',
        'transforms.v2': 'src/transforms/index.ts',
      },
      formats: ['cjs', 'es'],
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