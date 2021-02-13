import { App } from '@/App'
import { IActionConfig } from '../Actions/Action'
import { ActionManager } from '../Actions/ActionManager'

export async function showContextMenu(
	event: MouseEvent,
	actions: IActionConfig[]
) {
	event.preventDefault()
	event.stopImmediatePropagation()

	const app = await App.getApp()
	const actionManager = new ActionManager(app)

	actions.forEach(action => actionManager.create(action))

	app.contextMenu.show(event, actionManager)
}
