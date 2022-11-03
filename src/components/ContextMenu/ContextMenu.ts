import { markRaw, reactive, ref } from 'vue'
import { ActionManager } from '../Actions/ActionManager'

export interface IPosition {
	clientX: number
	clientY: number
}

export class ContextMenu {
	protected mayCloseOnClickOutside = true
	protected isVisible = ref(false)
	protected actionManager = ref<ActionManager | undefined>()
	protected position = reactive({
		x: 0,
		y: 0,
	})
	protected menuHeight = 0

	show(
		event: IPosition,
		actionManager: ActionManager,
		mayCloseOnClickOutside = true
	) {
		this.position.x = event.clientX
		this.position.y = event.clientY
		this.actionManager.value = markRaw(actionManager)
		this.mayCloseOnClickOutside = mayCloseOnClickOutside

		// Add up size of each context menu element + top/bottom padding
		this.menuHeight =
			this.actionManager.value
				.getAllElements()
				.reduce<number>((result, action) => {
					switch (action.type) {
						case 'submenu':
							return result + 40
						case 'divider':
							return result + 1
						case 'action':
						default:
							return result + 40
					}
				}, 0) + 16
		this.isVisible.value = true
	}

	setMayCloseOnClickOutside(mayCloseOnClickOutside: boolean) {
		setTimeout(() => {
			this.mayCloseOnClickOutside = mayCloseOnClickOutside
		}, 100)
	}
}
