const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const WorkerPlugin = require('worker-plugin')

module.exports = {
	runtimeCompiler: true,
	publicPath: process.env.NODE_ENV === 'production' ? '/editor/' : undefined,
	transpileDependencies: ['vuetify'],
	pwa: {
		name: 'bridge',
		appleMobileWebAppCapable: true,
		themeColor: '#1778D2',
		manifestOptions: {
			// display_modifiers: ['window-controls-overlay'],
		},
	},
	configureWebpack: {
		plugins: [new MonacoWebpackPlugin(), new WorkerPlugin()],
	},
}
