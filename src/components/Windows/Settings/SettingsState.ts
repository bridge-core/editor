import Vue from 'vue'

export let settingsState: Record<
	string,
	Record<string, unknown>
> = Vue.observable({})

export function setSettingsState(
	state: Record<string, Record<string, unknown>>
) {
	for (const key in state) {
		Vue.set(settingsState, key, state[key])
	}
}
