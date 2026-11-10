import eslint from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import compression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import viteImagemin from 'vite-plugin-imagemin'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import tsconfigPaths from 'vite-tsconfig-paths'

export default ({ mode }: { mode: string }) => {
	const env = loadEnv(mode, process.cwd())
	const isProduction = mode === 'production'
	const isDevelopment = mode === 'development'

	const HOST = env.VITE_REACT_HOST || 'localhost'
	const PORT = Number(env.VITE_REACT_PORT) || 3000

	return defineConfig({
		base: '/',
		publicDir: './public',
		resolve: {
			alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
		},
		esbuild: {
			sourcemap: !isProduction,
			drop: isProduction ? ['console', 'debugger'] : [],
			tsconfigRaw: {
				compilerOptions: {
					strict: true,
				},
			},
		},
		plugins: [
			tsconfigPaths(),
			react(),
			eslint(),
			ViteMinifyPlugin(),
			compression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
			compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
			viteImagemin({
				gifsicle: { optimizationLevel: 3 },
				optipng: { optimizationLevel: 6 },
				mozjpeg: { quality: 70 },
				webp: { quality: 70 },
				svgo: {
					plugins: [
						{ name: 'removeViewBox', active: false },
						{ name: 'cleanupIDs', active: true },
						{ name: 'removeEmptyAttrs', active: true },
					],
				},
				filter: (file: string) => {
					const extname = path.extname(file)

					return extname === '.png' && fs.existsSync(file)
				},
			}),
			createHtmlPlugin({
				minify: true,
			}),
		],
		build: {
			outDir: './build',
			assetsDir: 'assets',
			minify: 'esbuild',
			cssCodeSplit: true,
			sourcemap: isDevelopment,
			emptyOutDir: true,
			chunkSizeWarningLimit: 1500,
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
					passes: 3,
					ecma: 2020,
					unsafe: true,
				},
				mangle: {
					properties: {
						reserved: ['React', 'mobx'],
					},
				},
				module: true,
				output: { comments: false },
			},
			rollupOptions: {
				treeshake: true,
				onwarn(warning, warn) {
					if (warning?.code && ['SOURCE_MAP_ERROR', 'MODULE_LEVEL_DIRECTIVE'].includes(warning.code)) {
						return
					}

					warn(warning)
				},
				input: {
					main: path.resolve(__dirname, 'index.html'),
				},
				output: {
					entryFileNames: 'js/[name].[hash].js',
					chunkFileNames: 'js/[name].[hash].js',
					assetFileNames: 'assets/[name].[hash][extname]',
					manualChunks(id) {
						if (!id.includes('node_modules')) {
							return
						}

						switch (true) {
							case id.includes('@mui'):
								return 'mui'
							case id.includes('lodash'):
								return 'lodash'
							case id.includes('moment') || id.includes('dayjs'):
								return 'date-utils'
							case id.includes('three'):
								return 'three'
							case id.includes('sentry') || id.includes('analytics'):
								return 'analytics'
							case id.includes('vite') || id.includes('vite-plugin'):
								return 'vite-plugins'
							default:
								return 'vendor'
						}
					},
				},
			},
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		},
		server: {
			host: HOST,
			port: PORT,
			strictPort: true,
			open: `http://${HOST}:${PORT}`,
			watch: { usePolling: true },
		},
		preview: {
			host: HOST,
			port: PORT,
		},
	})
}
