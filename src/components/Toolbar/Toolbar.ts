import { ToolbarCategory } from './ToolbarCategory'
import Vue from 'vue'

export class Toolbar {
	protected state: Record<string, ToolbarCategory> = Vue.observable({})

	addCategory(category: ToolbarCategory) {
		Vue.set(this.state, category.id, category)
	}
	disposeCategory(category: ToolbarCategory) {
		Vue.delete(this.state, category.id)
	}
}
