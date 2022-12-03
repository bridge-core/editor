import { App } from '/@/App'
import { IActionConfig } from '../Actions/SimpleAction'
import { ActionManager } from '../Actions/ActionManager'
import { IContextMenuOptions, IPosition } from './ContextMenu'

export interface ISubmenuConfig {
	type: 'submenu'
	name: string
	icon: string
	actions: (IActionConfig | null | { type: 'divider' })[]
}

export type TActionConfig =
	| IActionConfig
	| ISubmenuConfig
	| { type: 'divider' }
	| null

export async function showContextMenu(
	event: MouseEvent | IPosition,
	actions: TActionConfig[],
	options: IContextMenuOptions = {}
) {
	let filteredActions = <
		(IActionConfig | ISubmenuConfig | { type: 'divider' })[]
	>actions.filter((action) => action !== null)

	if (event instanceof MouseEvent) {
		event.preventDefault()
		event.stopImmediatePropagation()
	}
	if (filteredActions.length === 0) return

	const app = await App.getApp()
	const actionManager = new ActionManager()

	filteredActions.forEach((action) => {
		switch (action.type) {
			case 'submenu':
				actionManager.addSubMenu(action)
				break
			case 'divider':
				actionManager.addDivider()
				break
			default:
				actionManager.create(action)
				break
		}
	})

	// This is necessary so an old click outside event doesn't close the new menu
	setTimeout(() => app.contextMenu.show(event, actionManager, options), 60)
}
