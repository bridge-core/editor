import Vue from 'vue'
import Vuetify from 'vuetify'
import { LocaleManager } from '../Locales/Manager'
import { vuetify } from './Vuetify'
import AppComponent from '/@/App.vue'

Vue.use(Vuetify)
Vue.config.productionTip = false

export const vue = new Vue({
	vuetify,
	render: (h) => h(AppComponent),
})

LocaleManager.setDefaultLanguage().then(() => {
	vue.$mount('#app')
})
