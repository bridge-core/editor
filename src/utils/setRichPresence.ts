interface RichPresenceOpts {
	enabled?: boolean
	details: string
	state: string
}

export async function setRichPresence(opts: RichPresenceOpts) {
	if (!import.meta.env.VITE_IS_TAURI_APP) return

	const { getCurrent } = await import('@tauri-apps/api/window')
	const { settingsState } = await import('/@/components/Windows/Settings/SettingsState')
	const window = await getCurrent()

	opts.enabled = <boolean>settingsState?.privacy?.discordRpc

	window.emit('setRichPresence', opts)
}

setRichPresence({
	details: 'Developing add-ons...',
	state: 'Idle',
})
