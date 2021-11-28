import { colorCodes } from './DefaultTheme/ColorCodes'
import { isNightly } from '/@/utils/app/isNightly'

export const bridgeDark = <const>{
	id: 'bridge.default.dark',
	name: 'Default Dark',
	colorScheme: 'dark',
	colors: {
		text: '#ffffff',

		primary: isNightly ? '#3bb6a3' : '#0073FF',
		secondary: isNightly ? '#3bb6a3' : '#0073FF',
		accent: isNightly ? '#3bb6a3' : '#0073FF',
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
		lineHighlightBackground: '#292929',
		scrollbarThumb: '#000000',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',
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
}

export const bridgeLight = <const>{
	id: 'bridge.default.light',
	name: 'Default Light',
	colorScheme: 'light',
	colors: {
		text: '#000000',

		primary: isNightly ? '#3bb6a3' : '#0073FF',
		secondary: isNightly ? '#3bb6a3' : '#0073FF',
		accent: isNightly ? '#3bb6a3' : '#0073FF',
		error: '#ff5252',
		info: '#2196f3',
		warning: '#fb8c00',
		success: '#4caf50',

		background: '#fafafa',
		sidebarNavigation: '#e8e8e8',
		expandedSidebar: '#e8e8e8',
		sidebarSelection: '#FFFFFF',
		menu: '#FFFFFF',
		tooltip: '#424242',
		toolbar: '#e0e0e0',
		footer: '#f5f5f5',
		tabActive: '#fafafa',
		tabInactive: '#e0e0e0',
		lineHighlightBackground: '#e0e0e0',
		scrollbarThumb: '#c8c8c8',

		behaviorPack: '#ff5252',
		resourcePack: '#0073FF',
		skinPack: '#fb8c00',
		worldTemplate: '#4caf50',
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
		...colorCodes('#000'),
	},
}
