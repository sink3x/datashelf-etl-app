import path from 'path'
import { defineConfig } from 'vitest/config'

const sourceAliases = [
  'services',
  'controllers',
  'routers',
  'interfaces',
  'middlewares',
  'models',
  'shared',
  'utils',
  'helpers',
  'validations',
  'documentation',
  'config',
  'errors',
  'repositories',
  'clients',
  'messaging',
]

export default defineConfig({
  resolve: {
    alias: sourceAliases.map((name) => ({
      find: new RegExp(`^@${name}/`),
      replacement: `${path.resolve(__dirname, 'src', name)}/`,
    })),
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/server.ts'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
