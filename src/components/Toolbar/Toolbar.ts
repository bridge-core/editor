import { ToolbarCategory } from './ToolbarCategory'
import { shallowReactive } from 'vue'

export class Toolbar {
	protected state: Record<string, ToolbarCategory> = shallowReactive({})

	addCategory(category: ToolbarCategory) {
		this.state[category.id] = category
	}
	disposeCategory(category: ToolbarCategory) {
		delete this.state[category.id]
	}
}
