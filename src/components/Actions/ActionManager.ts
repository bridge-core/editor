import { Action } from './Action'
import { IActionConfig } from './SimpleAction'
import { del, set, shallowReactive } from 'vue'
import type { KeyBindingManager } from './KeyBindingManager'
import { v4 as uuid } from 'uuid'
import { ISubmenuConfig } from '../ContextMenu/showContextMenu'

export class ActionManager {
	type = 'submenu'
	public state: Record<
		string,
		| Action
		| { type: 'divider' }
		| {
				type: 'submenu'
				icon: string
				name: string
				submenu: Submenu
		  }
	> = shallowReactive({})

	constructor(public readonly _keyBindingManager?: KeyBindingManager) {}

	get keyBindingManager() {
		if (!this._keyBindingManager)
			throw new Error(
				`No keyBindingManager was defined for this actionManager`
			)

		return this._keyBindingManager
	}

	create(actionConfig: IActionConfig) {
		const action = new Action(this, actionConfig)
		set(this.state, action.id, action)
		return action
	}
	getAction(actionId: string) {
		return <Action | undefined>this.state[actionId]
	}
	getAllActions() {
		return Object.values(this.state).filter(
			(action) => action.type === 'action'
		)
	}
	getAllElements() {
		return Object.values(this.state)
	}

	/**
	 * This is used by some classes that use an action manager as an abstraction to render action lists.
	 * e.g. showContextMenu(...)
	 */
	addDivider() {
		this.state[uuid()] = { type: 'divider' }
	}
	addSubMenu(submenuConfig: ISubmenuConfig) {
		const submenu = new Submenu()

		submenuConfig.actions.forEach((action) => {
			if (action === null) return

			if (action.type === 'divider') {
				submenu.addDivider()
			} else {
				submenu.create(action)
			}
		})
		this.state[uuid()] = {
			type: 'submenu',
			icon: submenuConfig.icon,
			name: submenuConfig.name,
			submenu,
		}
	}
	disposeAction(actionId: string) {
		del(this.state, actionId)
	}
	dispose() {
		Object.values(this.state).forEach((action) =>
			action.type === 'action' ? action.dispose() : null
		)
	}

	async trigger(actionId: string) {
		if (!this.state[actionId] || this.state[actionId].type !== 'action')
			throw new Error(
				`Failed to trigger "${actionId}": Action does not exist.`
			)

		// This must be an action because of the check above
		await (<Action>this.state[actionId]).trigger()
	}
}

export class Submenu extends ActionManager {
	type = 'submenu'
}
