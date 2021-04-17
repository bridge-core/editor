import VueCompositionAPI from '@vue/composition-api'
import Vue from 'vue'

// Called before setting up the WindowState class
export function setupCompositionAPI() {
	Vue.use(VueCompositionAPI)
}
