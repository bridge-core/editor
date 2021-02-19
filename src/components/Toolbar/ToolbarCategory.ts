import { App } from '/@/App'
import { Action } from '/@/components/Actions/Action'
import { IDisposable } from '/@/types/disposable'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { EventDispatcher } from '../Common/Event/EventDispatcher'

export class ToolbarCategory extends EventDispatcher<void> {
	public readonly id = uuid()
	protected type = 'category'
	protected isVisible = false

	protected state: Record<string, Action | ToolbarCategory> = Vue.observable(
		{}
	)
	protected disposables: Record<string, IDisposable | undefined> = {}

	constructor(protected icon: string, protected name: string) {
		super()
	}

	addItem(item: Action | ToolbarCategory) {
		Vue.set(this.state, item.id, item)
		this.disposables[item.id] = item.on(() => this.trigger())
		return this
	}
	disposeItem(item: Action | ToolbarCategory) {
		Vue.delete(this.state, item.id)
		this.disposables[item.id]?.dispose()

		this.disposables[item.id] = undefined
	}

	trigger() {
		this.isVisible = false
		this.dispatch()
	}

	dispose() {
		App.toolbar.disposeCategory(this)
	}
}
