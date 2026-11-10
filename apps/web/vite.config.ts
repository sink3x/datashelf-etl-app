import eslint from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv, type ConfigEnv, type Plugin } from 'vite'
import compression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import tsconfigPaths from 'vite-tsconfig-paths'

const normalizeBasePath = (value: string | undefined) => {
	const trimmed = (value || '/').trim()
	const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

	return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

const spaFallbackPlugin = (basePath: string): Plugin => {
	let outDir = ''

	return {
		name: 'datashelf-spa-fallback',
		apply: 'build',
		configResolved(config) {
			outDir = path.resolve(config.root, config.build.outDir)
		},
		closeBundle() {
			if (basePath === '/') {
				return
			}

			fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'))
		},
	}
}

const mockBuildPlugin = (isApiMock: boolean): Plugin => {
	let outDir = ''

	return {
		name: 'datashelf-mock-build',
		apply: 'build',
		configResolved(config) {
			outDir = path.resolve(config.root, config.build.outDir)
		},
		closeBundle() {
			if (isApiMock) {
				fs.copyFileSync(path.resolve(__dirname, 'config/app-config.demo.js'), path.join(outDir, 'app-config.js'))
				return
			}

			fs.rmSync(path.join(outDir, 'mockServiceWorker.js'), { force: true })
		},
	}
}

export default ({ command, mode }: ConfigEnv) => {
	const env = loadEnv(mode, process.cwd())
	const isBuild = command === 'build'

	const HOST = env.VITE_REACT_HOST || 'localhost'
	const PORT = Number(env.VITE_REACT_PORT) || 3000
	const BASE_PATH = normalizeBasePath(env.VITE_BASE_PATH)
	const IS_API_MOCK = env.VITE_API_MOCK === 'true'

	return defineConfig({
		base: BASE_PATH,
		publicDir: './public',
		resolve: {
			alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
		},
		esbuild: {
			drop: isBuild ? ['console', 'debugger'] : [],
		},
		plugins: [
			tsconfigPaths(),
			react(),
			{ ...eslint(), apply: 'serve' },
			compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
			compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
			createHtmlPlugin({ minify: true }),
			spaFallbackPlugin(BASE_PATH),
			mockBuildPlugin(IS_API_MOCK),
		],
		build: {
			outDir: './build',
			assetsDir: 'assets',
			minify: 'esbuild',
			cssCodeSplit: true,
			sourcemap: false,
			emptyOutDir: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning?.code && ['SOURCE_MAP_ERROR', 'MODULE_LEVEL_DIRECTIVE'].includes(warning.code)) {
						return
					}

					warn(warning)
				},
				output: {
					entryFileNames: 'js/[name].[hash].js',
					chunkFileNames: 'js/[name].[hash].js',
					assetFileNames: 'assets/[name].[hash][extname]',
				},
			},
		},
		server: {
			host: HOST,
			port: PORT,
			strictPort: true,
			open: `http://${HOST}:${PORT}${BASE_PATH}`,
			watch: { usePolling: true },
		},
		preview: {
			host: HOST,
			port: PORT,
		},
	})
}
