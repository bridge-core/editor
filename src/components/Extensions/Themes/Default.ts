import { colorCodes } from './DefaultTheme/ColorCodes'

export const bridgeDark = <const>{
	id: 'bridge.default.dark',
	name: 'Default Dark',
	colorScheme: 'dark',
	colors: {
		text: '#fff',

		primary: '#0073FF',
		secondary: '#0073FF',
		accent: '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#121212',
		sidebarNavigation: '#1F1F1F',
		expandedSidebar: '#1F1F1F',
		sidebarSelection: '#151515',
		menu: '#252525',
		footer: '#111111',
		tooltip: '#1F1F1F',
		toolbar: '#000000',
		tabActive: '#121212',
		tabInactive: '#1F1F1F',
		lineHighlightBackground: '#1F1F1F',
	},
	highlighter: {
		type: {
			color: '#a6e22e',
		},
		keyword: {
			color: '#f92672',
		},
		definition: {
			color: '#fd971f',
		},
		atom: {
			color: '#ae81ff',
		},
		number: {
			color: '#ae81ff',
		},
		string: {
			color: '#e6db74',
		},
		variable: {
			color: '#9effff',
		},
		variable_strong: {
			color: '#9effff',
		},
		meta: {
			color: 'white',
		},
		comment: {
			color: '#75715e',
		},
		...colorCodes,
	},
}

export const bridgeLight = <const>{
	id: 'bridge.default.light',
	name: 'Default Light',
	colorScheme: 'light',
	colors: {
		text: '#000',

		primary: '#0073FF',
		secondary: '#0073FF',
		accent: '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#fafafa',
		sidebarNavigation: '#FFFFFF',
		expandedSidebar: '#FFFFFF',
		sidebarSelection: '#ececec',
		menu: '#fff',
		tooltip: '#424242',
		toolbar: '#e0e0e0',
		footer: '#f5f5f5',
		tabActive: '#fafafa',
		tabInactive: '#ececec',
		lineHighlightBackground: '#e0e0e0',
	},
	highlighter: {
		property: {
			color: 'black',
		},
		keyword: {
			color: '#5A5CAD',
		},
		definition: {
			textDecoration: 'underline',
		},
		atom: {
			color: '#6C8CD5',
		},
		number: {
			color: '#164',
		},
		string: {
			color: 'red',
		},
		variable: {
			color: 'black',
		},
		variable_strong: {
			color: 'black',
		},
		meta: {
			color: 'yellow',
		},
		comment: {
			color: '#0080FF',
		},
		...colorCodes,
	},
}
