import { cpSync, readdirSync } from 'fs'
import path from 'path'
import { defineConfig } from 'tsup'

const OUT_DIRECTORY = path.resolve(__dirname, 'build')
const ROUTERS_DIRECTORY = path.resolve(__dirname, 'src/routers')

const copyAssets = async () => {
  cpSync(path.resolve(__dirname, 'public'), path.join(OUT_DIRECTORY, 'public'), { recursive: true })

  const documentationFileList = (readdirSync(ROUTERS_DIRECTORY, { recursive: true }) as string[]).filter((file) =>
    /\.ya?ml$/.test(file),
  )

  for (const file of documentationFileList) {
    cpSync(path.join(ROUTERS_DIRECTORY, file), path.join(OUT_DIRECTORY, 'openapi', path.basename(file)))
  }
}

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: OUT_DIRECTORY,
  format: ['cjs'],
  target: 'node22',
  platform: 'node',
  minify: false,
  sourcemap: true,
  dts: false,
  clean: true,
  splitting: false,
  noExternal: ['@datashelf/contracts'],
  outExtension: () => ({ js: '.cjs' }),
  onSuccess: copyAssets,
  esbuildOptions(options) {
    options.legalComments = 'none'
    options.define = {
      ...options.define,
      __BUNDLED__: 'true',
    }
  },
})
