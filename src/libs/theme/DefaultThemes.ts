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

		sidebarNavigation: '#1F1F1F',
		expandedSidebar: '#1F1F1F',
		sidebarSelection: '#151515',
		footer: '#111111',
		tooltip: '#1F1F1F',
		tabActive: '#121212',
		tabInactive: '#1F1F1F',
		lineHighlightBackground: '#292929',
		scrollbarThumb: '#000000',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',
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
