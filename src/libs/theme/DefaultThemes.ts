import { colorCodes } from './ColorCodes'

export const dark = {
	id: 'bridge.default.dark',
	name: 'Default Dark',
	colorScheme: 'dark',
	colors: {
		text: '#f2f2f2',
		textAlternate: '#f2f2f2AA',

		primary: '#0073FF',
		secondary: '#0073FF',
		accent: '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#121212',
		menu: '#252525',
		menuAlternate: '#1D1D1D',
		menuAlternate2: '#303030',
		toolbar: '#1D1D1D',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',

		sidebarNavigation: '#1F1F1F',
		expandedSidebar: '#1F1F1F',
		sidebarSelection: '#151515',
		footer: '#111111',
		tooltip: '#1F1F1F',
		tabActive: '#121212',
		tabInactive: '#1F1F1F',
		lineHighlightBackground: '#292929',
		scrollbarThumb: '#000000',
	},
	highlighter: {
		invalid: {
			color: '#ff00ff',
		},
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
			color: '#6e9eff',
		},
		variableStrong: {
			color: '#6e9eff',
		},
		meta: {
			color: 'white',
		},
		comment: {
			color: '#75715e',
		},
		...colorCodes('#fff'),
	},
} as const

export const light = {
	id: 'bridge.default.light',
	name: 'Default Light',
	colorScheme: 'light',
	colors: {
		text: '#000000',
		textAlternate: '#000000AA',

		primary: '#0073FF',
		secondary: '#0073FF',
		accent: '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#fafafa',
		menu: '#e8e8e8',
		menuAlternate: '#e0e0e0',
		menuAlternate2: '#d9d9d9',
		toolbar: '#fafafa',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',

		sidebarNavigation: '#e8e8e8',
		expandedSidebar: '#e8e8e8',
		sidebarSelection: '#FFFFFF',
		tooltip: '#424242',
		footer: '#f5f5f5',
		tabActive: '#fafafa',
		tabInactive: '#e0e0e0',
		lineHighlightBackground: '#e0e0e0',
		scrollbarThumb: '#c8c8c8',
	},
	highlighter: {
		type: {
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
		variableStrong: {
			color: 'black',
		},
		meta: {
			color: 'yellow',
		},
		comment: {
			color: '#0080FF',
		},
		...colorCodes('#fff'),
	},
} as const
