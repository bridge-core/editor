import { App } from '/@/App'
import { Control, IControl } from '../Control'
import ActionViewerComponent from './ActionViewer.vue'
import Vue from 'vue'
import { Action } from '/@/components/Actions/Action'

export class ActionViewer extends Control<any> {
	config: any = Vue.observable({ category: 'actions', action: {} })

	constructor(action: Action) {
		super(
			ActionViewerComponent,
			{
				category: 'actions',
				action: {},
				description: action.description,
				key: action.id,
				name: action.name,
			},
			undefined
		)
		this.config.action = action
	}

	matches(filter: string) {
		return (
			this.config.action.name.includes(filter) ||
			this.config.action.description.includes(filter)
		)
	}
	onChange = async () => {}
}
