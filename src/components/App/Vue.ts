import { createApp } from 'vue'
import AppComponent from '/@/App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi'
import en from '/@/locales/en'
import de from '/@/locales/de'
import nl from '/@/locales/nl'
import ko from '/@/locales/ko'
import zhCN from '/@/locales/zhCN'
import zhTW from '/@/locales/zhTW'
import ja from '/@/locales/ja'

export const vuetify = createVuetify({
	display: {
		mobileBreakpoint: 'xs',
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: {
			mdi,
		},
	},
	locale: {
		defaultLocale: 'en',
		messages: {
			nl,
			de,
			en,
			ko,
			zhCN,
			zhTW,
			ja,
		},
	},
	theme: {
		defaultTheme: 'dark',
		variations: false,
		themes: {
			dark: {
				colors: {
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
			},
			light: {
				colors: {
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
	},
})

export const vueApp = createApp(AppComponent)
vueApp.use(vuetify)
vueApp.mount('#app')
