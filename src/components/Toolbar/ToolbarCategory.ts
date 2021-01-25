import { App } from '@/App'
import { Action } from '@/components/Actions/Action'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export class ToolbarCategory {
	type = 'category'
	id = uuid()
	protected state: Record<string, Action | ToolbarCategory> = Vue.observable(
		{}
	)

	constructor(protected icon: string, protected name: string) {}

	addItem(item: Action | ToolbarCategory) {
		Vue.set(this.state, item.id, item)
		return this
	}
	disposeItem(item: Action | ToolbarCategory) {
		Vue.delete(this.state, item.id)
	}
	dispose() {
		App.toolbar.disposeCategory(this)
	}
}
