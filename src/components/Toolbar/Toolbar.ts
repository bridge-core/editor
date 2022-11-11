import { ToolbarCategory } from './ToolbarCategory'
import { reactive } from 'vue'
import { showContextMenu } from '../ContextMenu/showContextMenu'

export class Toolbar {
	protected state: Record<string, ToolbarCategory> = reactive({})

	addCategory(category: ToolbarCategory) {
		this.state[category.id] = category
	}
	disposeCategory(category: ToolbarCategory) {
		delete this.state[category.id]
	}

	showMobileMenu(event: MouseEvent) {
		showContextMenu(
			event,
			Object.values(this.state)
				.map((category) => [
					<const>{ type: 'divider' },
					category.toNestedMenu(),
				])
				.flat(1)
				.slice(1)
		)
	}
}
