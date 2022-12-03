// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}
// @ts-ignore
globalThis.window = globalThis
// @ts-ignore
globalThis.__TAURI_IPC__ = (ipcContext) => {
	self.postMessage({ type: 'ipc', ipcContext })
}

globalThis.addEventListener('message', (e) => {
	if (e.data.type === 'ipcCallback') {
		// @ts-ignore
		window[`_${e.data.id}`](e.data.data)
	}
})
