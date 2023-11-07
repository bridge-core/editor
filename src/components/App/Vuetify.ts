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
		options: {
			customProperties: true,
			variations: false,
		},
	},
})
