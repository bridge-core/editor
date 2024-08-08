import { defineConfig } from 'vite'
import { resolve, join } from 'path'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export const isNightly = process.argv[2] === '--nightly'
const iconPath = (filePath: string) => (isNightly ? `./img/icons/nightly/${filePath}` : `./img/icons/${filePath}`)

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	server: {
		strictPort: true,
		port: 8080,
	},
	json: {
		stringify: true,
	},
	resolve: {
		alias: {
			'@': join(__dirname, 'src'),
		},
	},
	plugins: [
		vue(),
		VitePWA({
			filename: 'service-worker.js',
			registerType: 'prompt',
			includeAssets: ['https://fonts.bunny.net/css?family=Roboto:100,300,400,500,700,900'],
			workbox: {
				globPatterns: ['**/*.{js,css,html,png,svg,woff2,woff,ttf,wasm,zip}'],
				maximumFileSizeToCacheInBytes: Number.MAX_SAFE_INTEGER,
			},
			manifest: {
				name: isNightly ? 'bridge Nightly' : 'bridge v2',
				short_name: isNightly ? 'bridge Nightly' : 'bridge v2',
				description: 'bridge. is a powerful IDE for Minecraft Bedrock Add-Ons.',
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
				launch_handler: {
					// @ts-ignore
					route_to: 'existing-client-retain',
					navigate_existing_client: 'never',
				},
				file_handlers: [
					{
						action: '/',
						accept: {
							'application/zip': ['.mcaddon', '.mcpack', '.mcworld', '.mctemplate'],
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
