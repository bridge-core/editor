import { reactive } from 'vue'

export let settingsState: Record<string, Record<string, unknown>> = reactive({})

export function setSettingsState(
	state: Record<string, Record<string, unknown>>
) {
	for (const key in state) {
		settingsState[key] = state[key]
	}
}
