import { ActionManager } from '../Actions/ActionManager'

export class ContextMenu {
	protected isVisible = false
	protected actionManager: ActionManager | undefined = undefined
	protected position = {
		x: 0,
		y: 0,
	}

	show(event: MouseEvent, actionManager: ActionManager) {
		this.position.x = event.clientX
		this.position.y = event.clientY
		this.actionManager = actionManager

		this.isVisible = true
	}
}
