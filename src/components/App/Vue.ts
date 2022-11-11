import { createApp } from 'vue'
import { LocaleManager } from '../Locales/Manager'
import { vuetify } from './Vuetify'
import AppComponent from '/@/App.vue'

const app = createApp(AppComponent)

app.use(vuetify)

LocaleManager.setDefaultLanguage().then(() => {
	app.mount('#app')
})
