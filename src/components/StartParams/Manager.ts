/**
 * Start paramters are encoded within the URL's search query
 */

import { openFileUrl } from './Action/openFileUrl'
import { openRawFileAction } from './Action/openRawFile'
import { setSidebarState } from './Action/sidebarState'

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

		const urlParams = new URLSearchParams(window.location.search)

		if ([...urlParams.keys()].length === 0) return

		import('lz-string').then(({ decompressFromEncodedURIComponent }) => {
			urlParams.forEach((value, name) => {
				const action = this.startActions.get(name)
				if (!action) return

				let decoded: string
				if (action.type === 'compressed') {
					let tmp = decompressFromEncodedURIComponent(value)
					if (!tmp) return
					decoded = tmp
				} else if (action.type === 'encoded') {
					decoded = decodeURIComponent(value)
				} else if (action.type === 'raw') {
					decoded = value
				} else {
					throw new Error(
						`Unknown start action type: "${action.type}"`
					)
				}

				action.onTrigger(decoded)
			})
		})
	}

	addStartAction(action: IStartAction) {
		this.startActions.set(action.name, action)

		return {
			dispose: () => this.startActions.delete(action.name),
		}
	}
}
