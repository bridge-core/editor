const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/editor/' : undefined,
	transpileDependencies: ['vuetify'],
	pwa: {
		name: 'bridge-lite',
		appleMobileWebAppCapable: true,
		themeColor: '#1778D2',
	},
	configureWebpack: {
		plugins: [new MonacoWebpackPlugin()],
	},
}
