import { defineConfig } from 'vite'
import { resolve, join } from 'path'
import vue from '@vitejs/plugin-vue'

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
	plugins: [vue()],
})
