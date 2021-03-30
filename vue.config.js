const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const WorkerPlugin = require('worker-plugin')
const { join } = require('path')

const isNightlyBuild = process.argv[3] === '--nightly'
const publicPath = isNightlyBuild
	? '/nightly/'
	: process.env.NODE_ENV === 'production'
	? '/editor/'
	: '/'

module.exports = {
	runtimeCompiler: true,
	publicPath,
	transpileDependencies: ['vuetify', 'molang'],

	pwa: {
		name: isNightlyBuild ? 'bridge Nightly' : 'bridge v2',
		appleMobileWebAppCapable: true,
		themeColor: '#1778D2',
		msTileColor: '#0F0F0F',
		manifestOptions: {
			background_color: '#0F0F0F',
			capture_links: [
				// 'existing-client-event', //Doesn't work yet but we can use "exisiting-client-navigate" because we're a SPA
				'existing-client-navigate',
			],
			file_handlers: [
				{
					action: publicPath,
					accept: {
						'application/zip': [
							'.mcaddon',
							'.mcpack',
							'.mcworld',
							'.mctemplate',
						],
						'application/json': ['.json'],
						'application/javascript': ['.js', '.ts'],
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
