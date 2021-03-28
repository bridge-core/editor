const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const WorkerPlugin = require('worker-plugin')
const { join } = require('path')

module.exports = {
	runtimeCompiler: true,
	publicPath:
		process.argv[3] === '--nightly'
			? '/nightly/'
			: process.env.NODE_ENV === 'production'
			? '/editor/'
			: undefined,
	transpileDependencies: ['vuetify', 'molang'],

	pwa: {
		name: 'bridge v2',
		appleMobileWebAppCapable: true,
		themeColor: '#1778D2',
		msTileColor: '#0F0F0F',
		manifestOptions: {
			background_color: '#0F0F0F',
			file_handlers: [
				{
					action: '/',
					accept: {
						'application/zip': ['.mcaddon', '.mcpack', '.mcworld'],
						'application/json': ['.json'],
						'text/plain': ['.mcfunction', '.molang', '.lang'],
					},
				},
			],
			// display_modifiers: ['window-controls-overlay'],
		},
	},
	configureWebpack: {
		resolve: {
			alias: {
				'/@': join(__dirname, './src'),
			},
		},
		plugins: [
			new MonacoWebpackPlugin({ features: ['!toggleHighContrast'] }),
			new WorkerPlugin({ globalObject: 'self' }),
		],
	},
}
