interface RichPresenceOpts {
	details: string
	state: string
}

export async function setRichPresence(opts: RichPresenceOpts) {
	if (!import.meta.env.VITE_IS_TAURI_APP) return

	const { getCurrent } = await import('@tauri-apps/api/window')
	const window = await getCurrent()

	window.emit('setRichPresence', opts)
}

setRichPresence({
	details: 'Developing add-ons...',
	state: 'Idle',
})
