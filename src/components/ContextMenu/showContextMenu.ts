import { App } from '/@/App'
import { IActionConfig } from '../Actions/SimpleAction'
import { ActionManager } from '../Actions/ActionManager'
import { IPosition } from './ContextMenu'

export async function showContextMenu(
	event: MouseEvent | IPosition,
	actions: (IActionConfig | { type: 'divider' } | null)[]
) {
	let filteredActions = <(IActionConfig | { type: 'divider' })[]>(
		actions.filter((action) => action !== null)
	)

	if (event instanceof MouseEvent) {
		event.preventDefault()
		event.stopImmediatePropagation()
	}
	if (filteredActions.length === 0) return

	const app = await App.getApp()
	const actionManager = new ActionManager()

	filteredActions.forEach((action) =>
		action.type === 'divider'
			? actionManager.addDivider()
			: actionManager.create(action)
	)

	app.contextMenu.show(event, actionManager)
}
