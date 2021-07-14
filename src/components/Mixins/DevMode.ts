// @ts-nocheck
import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export const DevModeMixin = {
	computed: {
		isDevMode() {
			return settingsState?.developers?.isDevMode ?? false
		},
	},
}
