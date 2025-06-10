import { defineConfig } from 'vite'
import { resolve } from 'path'

interface LibOptions {
  entry: string;
  fileName: string;
  outDir?: string;
}

export default function libConfig(options: LibOptions) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(__dirname, options.entry),
        name: "dl",
        formats: ["umd"],
        fileName: () => options.fileName,
      },
      outDir: options.outDir || "dist",
      emptyOutDir: false,
    }
  })
}
