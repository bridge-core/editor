/**
 * Start paramters are encoded within the URL's search query
 */

import { strToU8, strFromU8, unzlibSync } from 'fflate'
import { openFileUrl } from './Action/openFileUrl'
import { openRawFileAction } from './Action/openRawFile'
import { setSidebarState } from './Action/sidebarState'
import { viewExtension } from './Action/viewExtension'

export interface IStartAction {
	type: 'compressed' | 'encoded' | 'raw'
	name: string
	onTrigger: (value: string) => Promise<void> | void
}
export class StartParamManager {
	protected startActions = new Map<string, IStartAction>()

	constructor(actions: IStartAction[] = []) {
		actions.forEach((action) => this.addStartAction(action))
		this.addStartAction(openRawFileAction)
		this.addStartAction(openFileUrl)
		this.addStartAction(setSidebarState)
		this.addStartAction(viewExtension)

		this.parseRaw(window.location.search)
	}

	async parse(url: string) {
		// Get search query from url
		const searchStr = url.split('?')[1]
		if (!searchStr) return
		// Parse search query
		await this.parseRaw(searchStr)
	}

	protected async parseRaw(searchStr: string) {
		const urlParams = new URLSearchParams(searchStr)

		if ([...urlParams.keys()].length === 0) return

		urlParams.forEach(async (value, name) => {
			const action = this.startActions.get(name)
			if (!action) return

			let decoded: string
			if (action.type === 'compressed') {
				const binary = atob(value)

				// Support old compressed data; this was only shortly within a nightly build
				// So we should be able to remove this in the future
				if (!binary.startsWith('\x78\xDA')) {
					const { decompressFromEncodedURIComponent } = await import(
						'lz-string'
					)
					const tmp = decompressFromEncodedURIComponent(value)
					if (!tmp) return

					decoded = tmp
				}

				decoded = strFromU8(unzlibSync(strToU8(binary, true)))
			} else if (action.type === 'encoded') {
				decoded = decodeURIComponent(value)
			} else if (action.type === 'raw') {
				decoded = value
			} else {
				throw new Error(`Unknown start action type: "${action.type}"`)
			}

			action.onTrigger(decoded)
		})
	}

	addStartAction(action: IStartAction) {
		this.startActions.set(action.name, action)

		return {
			dispose: () => this.startActions.delete(action.name),
		}
	}
}
