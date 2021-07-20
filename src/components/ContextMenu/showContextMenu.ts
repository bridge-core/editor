import { App } from '/@/App'
import { IActionConfig } from '../Actions/SimpleAction'
import { ActionManager } from '../Actions/ActionManager'
import { IPosition } from './ContextMenu'

export async function showContextMenu(
	event: MouseEvent | IPosition,
	actions: (IActionConfig | null)[]
) {
	let filteredActions = <IActionConfig[]>(
		actions.filter((action) => action !== null)
	)

	if (event instanceof MouseEvent) {
		event.preventDefault()
		event.stopImmediatePropagation()
	}
	if (filteredActions.length === 0) return

	const app = await App.getApp()
	const actionManager = new ActionManager()

	filteredActions.forEach((action) => actionManager.create(action))

	app.contextMenu.show(event, actionManager)
}
