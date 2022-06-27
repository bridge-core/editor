/**
 * Start paramters are encoded within the URL's search query
 */

import { openRawFileAction } from './Action/openRawFile'

export interface IStartAction {
	name: string
	onTrigger: (value: string) => Promise<void> | void
}
export class StartParamManager {
	protected startActions = new Map<
		string,
		(value: string) => Promise<void> | void
	>()

	constructor(actions: IStartAction[] = []) {
		actions.forEach((action) => this.addStartAction(action))
		this.addStartAction(openRawFileAction)

		const urlParams = new URLSearchParams(window.location.search)

		if ([...urlParams.keys()].length === 0) return

		import('lz-string').then(({ decompressFromEncodedURIComponent }) => {
			urlParams.forEach((value, name) => {
				const decompressedValue = decompressFromEncodedURIComponent(
					value
				)
				if (!decompressedValue) return

				const action = this.startActions.get(name)
				if (!action) return
				action(decompressedValue)
			})
		})
	}

	addStartAction(action: IStartAction) {
		this.startActions.set(action.name, action.onTrigger)

		return {
			dispose: () => this.startActions.delete(action.name),
		}
	}
}
