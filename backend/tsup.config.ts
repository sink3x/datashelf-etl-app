import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './build',
  format: ['cjs', 'esm'],
  target: 'node20',
  minify: true,
  sourcemap: false,
  dts: false,
  clean: true,
  splitting: false,
  noExternal: [/(.*)/],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  outExtension: () => ({ js: '.mjs' }),
  esbuildOptions(options) {
    options.entryNames = 'index'
    options.define = {
      'process.env.NODE_ENV': JSON.stringify('production'),
    }
  },
})
