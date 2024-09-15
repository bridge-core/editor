import { colorCodes } from './ColorCodes'

export const dark = {
	id: 'bridge.default.dark',
	name: 'Default Dark',
	colorScheme: 'dark',
	font: 'Inter',
	colors: {
		primary: '#0073FF',
		accent: '#ffffff',
		accentSecondary: '#121212',

		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		text: '#ffffff',
		textSecondary: '#f2f2f2AA',

		background: '#121212',
		backgroundSecondary: '#1F1F1F',
		backgroundTertiary: '#373737',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',

		toolbar: '#1F1F1F',
		lineHighlightBackground: '#222222',
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
	font: 'Inter',
	colors: {
		primary: '#0073FF',
		secondary: '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',
		accent: '#ffffff',

		text: '#000000',
		textSecondary: '#000000AA',
		background: '#fafafa',
		backgroundSecondary: '#e8e8e8',
		backgroundTertiary: '#e0e0e0',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',

		toolbar: '#fafafa',
		lineHighlightBackground: '#e0e0e0',
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
