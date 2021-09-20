import { ActionManager } from '../Actions/ActionManager'

export interface IPosition {
	clientX: number
	clientY: number
}

export class ContextMenu {
	protected mayCloseOnClickOutside = true
	protected isVisible = false
	protected actionManager: ActionManager | undefined = undefined
	protected position = {
		x: 0,
		y: 0,
	}

	show(
		event: IPosition,
		actionManager: ActionManager,
		mayCloseOnClickOutside = true
	) {
		this.position.x = event.clientX
		this.position.y = event.clientY
		this.actionManager = actionManager
		this.mayCloseOnClickOutside = mayCloseOnClickOutside

		this.isVisible = true
	}

	setMayCloseOnClickOutside(mayCloseOnClickOutside: boolean) {
		setTimeout(() => {
			this.mayCloseOnClickOutside = mayCloseOnClickOutside
		}, 100)
	}
}
