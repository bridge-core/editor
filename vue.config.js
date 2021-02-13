const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const WorkerPlugin = require('worker-plugin')

module.exports = {
	runtimeCompiler: true,
	publicPath: process.env.NODE_ENV === 'production' ? '/editor/' : undefined,
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
		plugins: [
			new MonacoWebpackPlugin({ features: ['!toggleHighContrast'] }),
			new WorkerPlugin(),
		],
	},
}
