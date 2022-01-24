import Vue from 'vue'
import AppComponent from '/@/App.vue'

import Vuetify from 'vuetify'
import en from '/@/locales/en'
import de from '/@/locales/de'
import nl from '/@/locales/nl'
import ko from '/@/locales/ko'
import zhCN from '/@/locales/zhCN'
import zhTW from '/@/locales/zhTW'
import ja from '/@/locales/ja'

Vue.use(Vuetify)
Vue.config.productionTip = false

export const vuetify = new Vuetify({
	lang: {
		locales: { nl, de, en, ko, zhCN, zhTW, ja },
	},
	breakpoint: {
		mobileBreakpoint: 'xs',
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

export const vue = new Vue({
	vuetify,
	render: (h) => h(AppComponent),
})
vue.$mount('#app')
