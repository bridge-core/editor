import { ToolbarCategory } from './ToolbarCategory'
import { del, set, shallowReactive } from '@vue/composition-api'

export class Toolbar {
	protected state: Record<string, ToolbarCategory> = shallowReactive({})

	addCategory(category: ToolbarCategory) {
		set(this.state, category.id, category)
	}
	disposeCategory(category: ToolbarCategory) {
		del(this.state, category.id)
	}
}
