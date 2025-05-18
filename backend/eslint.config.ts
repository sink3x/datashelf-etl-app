import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import importXPlugin from 'eslint-plugin-import-x'
import prettierPlugin from 'eslint-plugin-prettier'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: ['node_modules', 'build', '*.d.ts', '*.config.*'],
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import-x': importXPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': 'off',
      'no-empty': 'off',
      'no-fallthrough': 'warn',
      'no-extra-boolean-cast': 'warn',
      semi: 'off',
      indent: 'off',

      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'import/no-unresolved': 'error', // заменяет import-x/no-unresolved
      'import-x/named': 'error',
      'import-x/default': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            { pattern: '@routers/**', group: 'internal', position: 'before' },
            { pattern: '@middlewares/**', group: 'internal', position: 'before' },
            { pattern: '@validations/**', group: 'internal', position: 'before' },
            { pattern: '@models/**', group: 'internal', position: 'before' },
            { pattern: '@controllers/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
            { pattern: '@helpers/**', group: 'internal', position: 'before' },
            { pattern: '@utils/**', group: 'internal', position: 'before' },
            { pattern: '@interfaces/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'prettier/prettier': 'off',
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@controllers', './src/controllers'],
            ['@routers', './src/routers'],
            ['@interfaces', './src/interfaces'],
            ['@middlewares', './src/middlewares'],
            ['@models', './src/models'],
            ['@shared', './src/shared'],
            ['@utils', './src/utils'],
            ['@helpers', './src/helpers'],
            ['@validations', './src/validations'],
            ['@documentation', './src/documentation'],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      },
    },
  },
]
