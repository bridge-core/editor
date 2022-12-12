export function setupWorker(worker: Worker) {
	// This Tauri IPC workaround is only needed for the Tauri app
	if (!import.meta.env.VITE_IS_TAURI_APP) return

	worker.addEventListener('message', (e) => {
		if (e.data.type === 'ipc') {
			// @ts-ignore
			const { callback, error: errorId } = e.data.ipcContext

			// @ts-ignore
			window[`_${errorId}`] = (error: any) => {
				worker.postMessage({
					type: 'ipcCallback',
					id: errorId,
					data: error,
				})
				Reflect.deleteProperty(window, `_${errorId}`)
				Reflect.deleteProperty(window, `_${callback}`)
			}
			// @ts-ignore
			window[`_${callback}`] = (data: any) => {
				worker.postMessage({
					type: 'ipcCallback',
					id: callback,
					data,
				})
				Reflect.deleteProperty(window, `_${errorId}`)
				Reflect.deleteProperty(window, `_${callback}`)
			}

			// @ts-ignore
			window.__TAURI_IPC__(e.data.ipcContext)
		}
	})
}
