export let settingsState: Record<string, Record<string, unknown>>

export function setSettingsState(
	state: Record<string, Record<string, unknown>>
) {
	settingsState = state
}
