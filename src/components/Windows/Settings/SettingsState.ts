import { reactive, set } from 'vue'

export let settingsState: Record<string, Record<string, unknown> | null> =
	reactive({
		sidebar: null,
	})

export function setSettingsState(
	state: Record<string, Record<string, unknown>>
) {
	for (const key in state) {
		set(settingsState, key, state[key])
	}
}
