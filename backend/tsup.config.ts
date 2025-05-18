import copy from 'esbuild-copy-static-files'
import { createRequire } from 'module'
import path from 'path'
import { defineConfig } from 'tsup'

const OUT_DIRECTORY = './build'
const require = createRequire(import.meta.url)
const swaggerUiDistPath = path.dirname(require.resolve('swagger-ui-dist/package.json'))

const FILENAME_LIST_FOR_COPY = ['swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css']
const copiedFileList = FILENAME_LIST_FOR_COPY.map((fileName) => {
  return copy({
    src: path.join(swaggerUiDistPath, fileName),
    dest: path.resolve(__dirname, `${OUT_DIRECTORY}/${fileName}`),
  })
})

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: OUT_DIRECTORY,
  format: ['cjs'],
  target: 'node20',
  minify: true,
  sourcemap: false,
  dts: false,
  clean: true,
  splitting: false,
  noExternal: [/(.*)/],
  outExtension: () => ({ js: '.cjs' }),
  esbuildPlugins: copiedFileList,
  esbuildOptions(options) {
    options.legalComments = 'none'
    options.entryNames = 'index'
    options.define = {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }
  },
})
