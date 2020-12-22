import Vue from 'vue'
import App from './App.vue'
//@ts-expect-error
import Vuetify from 'vuetify/lib'
import './registerServiceWorker'
import '@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.css'
import en from '@/locales/en'
import de from '@/locales/de'
import nl from '@/locales/nl'
import ko from '@/locales/ko'

Vue.config.productionTip = false

Vue.use(Vuetify)

export const vuetify = new Vuetify({
	lang: {
		locales: { nl, de, en, ko },
	},
	theme: {
		dark: true,
		options: {
			customProperties: true,
		},
		themes: {
			dark: {
				primary: '#1778D2',
				secondary: '#1778D2',
				accent: '#1778D2',

				background: '#121212',
				sidebarNavigation: '#1F1F1F',
				expandedSidebar: '#1F1F1F',
				menu: '#424242',
				footer: '#111111',
				tooltip: '#1F1F1F',
			},
			light: {
				primary: '#1778D2',
				secondary: '#1778D2',
				accent: '#1778D2',

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
	// @ts-expect-error
	vuetify,
	render: h => h(App),
}).$mount('#app')
