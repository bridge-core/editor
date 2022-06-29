import { ToolbarCategory } from './ToolbarCategory'
import { ref } from 'vue'

export class Toolbar {
	protected state = ref<Record<string, ToolbarCategory>>({})

	addCategory(category: ToolbarCategory) {
		this.state.value[category.id] = category
	}
	disposeCategory(category: ToolbarCategory) {
		delete this.state.value[category.id]
	}
}
