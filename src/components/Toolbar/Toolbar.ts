import { ToolbarCategory } from './ToolbarCategory'
import { del, reactive, set } from 'vue'
import { showContextMenu } from '../ContextMenu/showContextMenu'

export class Toolbar {
	protected state: Record<string, ToolbarCategory> = reactive({})

	addCategory(category: ToolbarCategory) {
		set(this.state, category.id, category)
	}
	disposeCategory(category: ToolbarCategory) {
		del(this.state, category.id)
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
