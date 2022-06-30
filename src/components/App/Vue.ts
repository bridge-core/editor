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
import { bridgeDark, bridgeLight } from '../Extensions/Themes/Default'

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
				dark: true,
				colors: bridgeDark.colors,
			},
			light: {
				dark: false,
				colors: bridgeLight.colors,
			},
		},
	},
})

export const vueApp = createApp(AppComponent)
vueApp.use(vuetify)
vueApp.mount('#app')
