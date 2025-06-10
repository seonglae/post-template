import libConfig from './vite.base.config'

export default libConfig({
  entry: 'src/transforms/index.ts',
  fileName: 'transforms.v2.js',
  outDir: 'public',
})
