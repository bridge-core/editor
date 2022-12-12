// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

// This Tauri IPC workaround is only needed for the Tauri app
if (
	import.meta.env.VITE_IS_TAURI_APP &&
	!(<any>globalThis)._didSetupTauriWorkaround
) {
	;(<any>globalThis)._didSetupTauriWorkaround = true

	// @ts-ignore
	globalThis.window = globalThis
	// @ts-ignore
	globalThis.__TAURI_IPC__ = (ipcContext) => {
		self.postMessage({ type: 'ipc', ipcContext })
	}

	globalThis.addEventListener('message', (e) => {
		if (e.data.type === 'ipcCallback') {
			const callbackId = `_${e.data.id}`

			if (typeof (<any>window)[callbackId] === 'function') {
				;(<any>window)[callbackId](e.data.data)
			} else {
				console.warn(`No callback found for id ${e.data.id}!`)
			}
		}
	})
}
