import { settingsState } from '../Windows/Settings/SettingsState'

export const EnablePackSpiderMixin = {
	data: () => ({
		settingsState,
	}),
	computed: {
		enablePackSpider() {
			return settingsState?.general?.enablePackSpider ?? false
		},
	},
}
