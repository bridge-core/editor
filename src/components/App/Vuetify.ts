import Vuetify from 'vuetify'
import { iconMap } from './Icon/IconMap'

export const vuetify = new Vuetify({
	breakpoint: {
		mobileBreakpoint: 'xs',
	},
	icons: {
		iconfont: 'mdi',
		values: Object.fromEntries(
			Object.entries(iconMap).map(([name, icon]) => [
				name,
				{ component: icon },
			])
		),
	},
	theme: {
		dark: true,
		options: {
			customProperties: true,
			variations: false,
		},
		themes: {
			dark: {
				primary: '#0073FF',
				secondary: '#0073FF',
				accent: '#0073FF',

				background: '#121212',
				sidebarNavigation: '#1F1F1F',
				expandedSidebar: '#1F1F1F',
				menu: '#424242',
				footer: '#111111',
				tooltip: '#1F1F1F',
			},
			light: {
				primary: '#0073FF',
				secondary: '#0073FF',
				accent: '#0073FF',

				background: '#fafafa',
				sidebarNavigation: '#FFFFFF',
				expandedSidebar: '#FFFFFF',
				tooltip: '#424242',
				toolbar: '#e0e0e0',
				footer: '#f5f5f5',
			},
		},
	},
})
