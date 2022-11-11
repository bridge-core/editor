import '@mdi/font/css/materialdesignicons.min.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { bridgeDark } from '../Extensions/Themes/Default'
import { iconMap } from './Icon/IconMap'

export const vuetify = createVuetify({
	display: {
		mobileBreakpoint: 'xs',
	},
	icons: {
		defaultSet: 'mdi',
		aliases: {
			blockbench: 'mdi-cube-outline',
		},
		sets: {},
		// TODO(Vue3): Add blockbench icon back: https://next.vuetifyjs.com/en/features/icon-fonts/#creating-a-custom-icon-set
		// values: Object.fromEntries(
		// 	Object.entries(iconMap).map(([name, icon]) => [
		// 		name,
		// 		{ component: icon },
		// 	])
		// ),
	},
	defaults: {
		VAutocomplete: {
			variant: 'solo',
		},
	},
	theme: {
		defaultTheme: 'dark',
		variations: false,

		themes: {
			dark: {
				dark: true,
				colors: bridgeDark.colors,
			},
			light: {
				dark: false,
				colors: bridgeDark.colors,
			},
		},
	},
})
