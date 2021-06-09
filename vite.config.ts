import { defineConfig } from 'vite'
import { resolve, join } from 'path'
import { createVuePlugin } from 'vite-plugin-vue2'

// https://vitejs.dev/config/
export default defineConfig({
	base: '/editor/',
	server: {
		port: 8080,
	},
	resolve: {
		alias: {
			'/@': join(__dirname, 'src'),
		},
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				// nested: resolve(__dirname, 'nested/index.html'),
			},
		},
	},
	plugins: [createVuePlugin()],
})
