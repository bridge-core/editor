import { App } from '@/App'
import { Control, IControl } from '../Control'
import ActionViewerComponent from './ActionViewer.vue'
import Vue from 'vue'
import { Action } from '@/components/Actions/Action'

export class ActionViewer {
	public readonly component = ActionViewerComponent
	config: any = Vue.observable({ category: 'actions', action: {} })
	value = undefined

	constructor(action: Action) {
		this.config.action = action
	}

	matches(filter: string) {
		return (
			this.config.action.name.includes(filter) ||
			this.config.action.description.includes(filter)
		)
	}
	async onChange() {}
}
