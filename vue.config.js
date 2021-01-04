const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/editor/' : undefined,
	transpileDependencies: ['vuetify'],
	pwa: {
		name: 'bridge',
		appleMobileWebAppCapable: true,
		themeColor: null, // Vue automatically inserts the meta.themeColor tag. That clashes with our themeManager so we have to disable it...
		manifestOptions: {
			// display_modifiers: ['window-controls-overlay'],
		},
	},
	configureWebpack: {
		plugins: [new MonacoWebpackPlugin()],
	},
}
