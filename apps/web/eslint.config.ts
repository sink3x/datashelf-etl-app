import globals from 'globals'
import path from 'path'

import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettierPlugin from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['build', 'dist', '*.config.*', '*.d.ts', '*.json'] },

	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			sourceType: 'module',
			parser: tseslint.parser,
			ecmaVersion: 'latest',
			parserOptions: {
				project: ['./tsconfig.app.json'],
				tsconfigRootDir: path.resolve(),
				ecmaFeatures: { jsx: true },
				warnOnUnsupportedTypeScriptVersion: false,
			},
			globals: globals.browser,
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				alias: {
					map: [
						['@assets', './src/assets'],
						['@components', './src/components'],
						['@hooks', './src/hooks'],
						['@layouts', './src/layouts'],
						['@pages', './src/pages'],
						['@redux', './src/redux'],
						['@shared', './src/shared'],
						['@utils', './src/utils'],
						['@styles', './src/styles'],
						['@interfaces', './src/interfaces'],
						['@services', './src/services'],
						['@stores', './src/stores'],
						['@ui', './src/ui'],
						['@lib', './src/lib'],
						['@router', './src/router'],
					],
					extensions: ['.ts', '.tsx'],
				},
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'jsx-a11y': jsxA11y,
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			import: require('eslint-plugin-import'),
			prettier: prettierPlugin,
			'unused-imports': unusedImports,
			sonarjs: require('eslint-plugin-sonarjs'),
			promise: require('eslint-plugin-promise'),
		},
		rules: {
			...reactHooks.configs.recommended.rules,

			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

			'prettier/prettier': ['error', { endOfLine: 'auto' }],

			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/no-throw-literal': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],

			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
					pathGroups: [
						{
							pattern: 'react',
							group: 'external',
							position: 'before',
						},
						{
							pattern: 'react-dom',
							group: 'external',
							position: 'before',
						},
						{
							pattern:
								'@{assets,components,hooks,layouts,pages,redux,shared,utils,styles,interfaces,services,store}/**',
							group: 'internal',
							position: 'after',
						},
						{
							pattern: '../**',
							group: 'internal',
							position: 'after',
						},
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],

			'react/no-deprecated': 0,
			'react/no-unescaped-entities': 'warn',
			'react/no-string-refs': 'warn',
			'react/no-children-prop': 'off',
			'react/no-unused-prop-types': 'off',
			'react/no-find-dom-node': 1,
			'react/prop-types': 'off',
			'react/display-name': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react/jsx-no-target-blank': 'warn',
			'react/jsx-indent': 'off',
			'react/jsx-one-expression-per-line': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/require-default-props': 'off',
			'react/forbid-prop-types': 'off',
			'react/no-did-mount-set-state': 'off',
			'react/self-closing-comp': 'off',
			'react/function-component-definition': [
				'error',
				{
					namedComponents: 'arrow-function',
					unnamedComponents: 'arrow-function',
				},
			],

			'jsx-a11y/control-has-associated-label': 'off',
			'jsx-a11y/no-noninteractive-element-interactions': 'off',
			'jsx-a11y/click-events-have-key-events': 'off',
			'jsx-a11y/no-static-element-interactions': 'off',
			'jsx-a11y/anchor-is-valid': [
				'error',
				{
					components: ['Link'],
					specialLink: ['to'],
				},
			],
			'jsx-a11y/label-has-for': [
				'error',
				{
					required: { every: ['id'] },
				},
			],

			'no-unused-vars': 'off',
			'arrow-parens': 'off',
			'arrow-body-style': 'off',
			'function-paren-newline': 'off',
			'space-before-function-paren': 'off',
			radix: 'off',
			'prefer-destructuring': 'off',
			semi: 'off',
			indent: 'off',
			'consistent-return': 'off',
			'object-curly-newline': 'off',
			'linebreak-style': 'off',
			'require-jsdoc': 'off',
			'import/no-named-as-default': 'off',
			'import/prefer-default-export': 'off',
			'no-console': 'off',
			'no-plusplus': 'off',
			'no-tabs': 'off',
			'no-undef': 'off',
			'no-empty': 'off',
			'no-semi': 'off',
			'no-param-reassign': 'off',
			'no-underscore-dangle': 'off',
			'no-useless-escape': 1,
			'no-fallthrough': 1,
			'no-extra-boolean-cast': 1,
			'no-mixed-operators': 'off',
			'no-case-declarations': 'off',
			'no-restricted-globals': 'off',
			'no-control-regex': 'off',

			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/cognitive-complexity': ['warn', 15],
			'sonarjs/no-identical-functions': 'warn',
			'sonarjs/prefer-immediate-return': 'warn',

			'promise/always-return': 'error',
			'promise/no-return-wrap': 'error',
			'promise/catch-or-return': 'error',
			'promise/no-nesting': 'warn',
			'promise/no-promise-in-callback': 'warn',
		},
	},
)
