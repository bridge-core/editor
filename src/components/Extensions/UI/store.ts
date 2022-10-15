import { v4 as uuid } from 'uuid'
import { Signal } from '../../Common/Event/Signal'
import { basename, extname } from '/@/utils/path'

export type TUIStore = ReturnType<typeof createUIStore>
export function createUIStore() {
	let UI: any = {}
	let storeUUID: string | null = uuid()

	return {
		get UI() {
			return UI
		},
		allLoaded: new Signal<void>(),
		set(path: string[], component: () => Promise<unknown>) {
			let current = UI

			while (path.length > 1) {
				const key = <string>path.shift()
				if (current[key] === undefined) current[key] = {}

				current = current[key]
			}

			const key = <string>path.shift()
			current[basename(key, extname(key))] = component
		},
		dispose() {
			UI = null
			storeUUID = null
		},
	}
}
