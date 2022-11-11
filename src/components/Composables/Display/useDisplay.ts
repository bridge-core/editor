import { computed } from 'vue'
import { vuetify } from '../../App/Vuetify'

export function useDisplay() {
	return {
		isMobile: computed(() => vuetify.framework.display.mobile),
		isMinimalDisplay: computed(() => {
			return !vuetify.framework.display.mdAndUp
		}),
	}
}
