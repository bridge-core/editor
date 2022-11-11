import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { resolve, join } from 'path'
import Vue from '@vitejs/plugin-vue2'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
const isNightly = process.argv[2] === '--nightly'
const iconPath = (filePath: string) =>
	isNightly ? `./img/icons/nightly/${filePath}` : `./img/icons/${filePath}`

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	server: {
		port: 8080,
	},
	json: {
		stringify: true,
	},
	resolve: {
		alias: {
			'/@': join(__dirname, 'src'),
			vue: 'vue/dist/vue.esm.js',
			molangjs: join(__dirname, './src/utils/MoLangJS.ts'),
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				// nested: resolve(__dirname, 'nested/index.html'),
			},
		},
	},
	plugins: [
		splitVendorChunkPlugin(),
		Vue({}),
		ViteEjsPlugin({
			isNightly,
			title: isNightly ? 'bridge Nightly' : 'bridge v2',
		}),

		/**
		 * VS Code's JSON language files has an issue with large JSON files
		 * This is caused by Array.prototype.push.apply(...) throws a maximum call stack size exceeded error
		 * with sufficiently large arrays
		 *
		 * https://github.com/bridge-core/editor/issues/447
		 */
		{
			name: 'fix-vscode-json-language-service-bug',
			transform: (source, id) => {
				if (
					id.includes('json.worker.js') &&
					id.includes('node_modules/monaco-editor/')
				)
					return source.replace(
						'Array.prototype.push.apply(this.schemas, other.schemas);',
						'this.schemas = this.schemas.concat(other.schemas);'
					)

				return source
			},
		},

		VitePWA({
			filename: 'service-worker.js',
			registerType: 'prompt',
			includeAssets: [
				'https://fonts.bunny.net/css?family=Roboto:100,300,400,500,700,900',
			],
			workbox: {
				globPatterns: [
					'**/*.{js,css,html,png,svg,woff2,woff,ttf,wasm,zip}',
				],
				maximumFileSizeToCacheInBytes: Number.MAX_SAFE_INTEGER,
			},
			manifest: {
				name: isNightly ? 'bridge Nightly' : 'bridge v2',
				short_name: isNightly ? 'bridge Nightly' : 'bridge v2',
				description:
					'bridge. is a powerful IDE for Minecraft Bedrock Add-Ons.',
				categories: ['development', 'utilities', 'productivity'],
				theme_color: '#1778D2',
				icons: [
					{
						src: iconPath('android-chrome-192x192.png'),
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: iconPath('android-chrome-512x512.png'),
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: iconPath('android-chrome-maskable-192x192.png'),
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: iconPath('android-chrome-maskable-512x512.png'),
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
				start_url: '.',
				display: 'standalone',
				background_color: '#0F0F0F',
				// @ts-ignore
				launch_handler: {
					route_to: 'existing-client-retain',
					navigate_existing_client: 'never',
				},
				file_handlers: [
					{
						action: '/',
						accept: {
							'application/zip': [
								'.mcaddon',
								'.mcpack',
								'.mcworld',
								'.mctemplate',
							],
							'application/json': ['.json', '.bbmodel'],
							'application/javascript': ['.js', '.ts'],
							'text/plain': ['.mcfunction', '.molang', '.lang'],
							'image/*': ['.tga', '.png', '.jpg', '.jpeg'],
						},
					},
				],
				display_override: ['window-controls-overlay', 'standalone'],
				screenshots: [
					{
						src: './img/install-screenshots/narrow/screenshot-1.png',
						type: 'image/png',
						sizes: '540x720',
						platform: 'narrow',
					},
					{
						src: './img/install-screenshots/narrow/screenshot-2.png',
						type: 'image/png',
						sizes: '540x720',
						platform: 'narrow',
					},
					{
						src: './img/install-screenshots/narrow/screenshot-3.png',
						type: 'image/png',
						sizes: '540x720',
						platform: 'narrow',
					},

					{
						src: './img/install-screenshots/wide/screenshot-1.png',
						type: 'image/png',
						sizes: '1080x720',
						platform: 'wide',
					},
					{
						src: './img/install-screenshots/wide/screenshot-2.png',
						type: 'image/png',
						sizes: '1080x720',
						platform: 'wide',
					},
				],
			},
		}),
	],
})
