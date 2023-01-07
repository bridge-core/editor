import { computed } from 'vue'
import { settingsState } from '../Windows/Settings/SettingsState'

export function useHighContrast() {
	return <const>{
		highContrast: computed(
			() => settingsState.appearance?.highContrast ?? false
		),
	}
}
