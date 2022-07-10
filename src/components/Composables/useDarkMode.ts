import { computed } from 'vue'
import { vuetify } from '../App/Vuetify'

export function useDarkMode() {
	return {
		isDarkMode: computed(() => vuetify.framework.theme.dark),
	}
}
