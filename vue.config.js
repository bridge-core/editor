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
		manifestOptions: {
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
			new WorkerPlugin(),
		],
	},
}
