import { App } from '/@/App'
import { IActionConfig } from '../Actions/SimpleAction'
import { ActionManager } from '../Actions/ActionManager'
import { IPosition } from './ContextMenu'

export async function showContextMenu(
	event: MouseEvent | IPosition,
	actions: IActionConfig[]
) {
	if (event instanceof MouseEvent) {
		event.preventDefault()
		event.stopImmediatePropagation()
	}
	if (actions.length === 0) return

	const app = await App.getApp()
	const actionManager = new ActionManager()

	actions.forEach((action) => actionManager.create(action))

	app.contextMenu.show(event, actionManager)
}
